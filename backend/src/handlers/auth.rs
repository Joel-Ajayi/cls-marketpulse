use crate::db::connect::get_connection;
use crate::db::models::{NewOtpMetadata, NewUser, User};
use crate::db::schema::{otp_metadata, users};
use crate::db::seed_user_defaults;
use crate::libs::Crypto;
use crate::services::email::send_email;
use crate::AppState;
use axum::{extract::State, http::StatusCode, Json};
use chrono::{Duration, Utc};
use diesel::prelude::*;
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct RequestOtpPayload {
    pub email: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub message: String,
    pub token: Option<String>,
    pub user: Option<UserResponse>,
}

#[derive(Serialize)]
pub struct UserResponse {
    pub id: uuid::Uuid,
    pub email: String,
}

pub async fn request_otp(
    State(state): State<AppState>,
    Json(payload): Json<RequestOtpPayload>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    // 1. Generate OTP (Alphanumeric)
    let otp_code = Crypto::otp();
    let expires_at = Utc::now().naive_utc() + Duration::minutes(10);

    // 2. Save OTP (Store email directly, no user creation yet)
    diesel::insert_into(otp_metadata::table)
        .values(NewOtpMetadata {
            email: &payload.email,
            code: &otp_code,
            expires_at,
        })
        .execute(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 3. Send Email via Resend
    let email_body = format!(
        r#"
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f5;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #16a34a; text-align: center; margin-bottom: 24px;">MarketPulse</h1>
                <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Hello,</p>
                <p style="color: #374151; font-size: 16px; margin-bottom: 32px;">Please use the following code to complete your login verification:</p>
                
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 32px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">{}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">This code is valid for 10 minutes.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #9ca3af; font-size: 12px;">&copy; MarketPulse 2026</p>
            </div>
        </div>
        "#,
        otp_code
    );
    let _ = send_email(&payload.email, "Your MarketPulse Login Code", email_body).await?;

    let message = format!("OTP sent to {}", payload.email);
    Ok(Json(AuthResponse {
        message,
        token: None,
        user: None,
    }))
}

#[derive(Deserialize)]
pub struct VerifyOtpPayload {
    pub email: String,
    pub code: String,
}

pub async fn verify_otp(
    State(state): State<AppState>,
    Json(payload): Json<VerifyOtpPayload>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;
    let now = Utc::now().naive_utc();

    // 1. Validate OTP
    let valid_otp = otp_metadata::table
        .filter(otp_metadata::email.eq(&payload.email))
        .filter(otp_metadata::code.eq(&payload.code))
        .filter(otp_metadata::expires_at.gt(now))
        .first::<crate::db::models::OtpMetadata>(&mut conn)
        .optional()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if valid_otp.is_none() {
        return Err((
            StatusCode::UNAUTHORIZED,
            "Invalid or expired OTP".to_string(),
        ));
    }

    // 2. Find or Create User
    // Check if user exists
    let mut user_option = users::table
        .filter(users::email.eq(&payload.email))
        .first::<User>(&mut conn)
        .optional()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user = if let Some(existing_user) = user_option {
        existing_user
    } else {
        // Create new user
        let new_user = diesel::insert_into(users::table)
            .values(NewUser {
                email: &payload.email,
            })
            .get_result::<User>(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        // Seed Default Data for New User
        seed_user_defaults(&mut conn, new_user.id)?;
        new_user
    };

    // 3. Generate JWT
    let token = Crypto::generate_jwt(user.id.to_string(), 15)?;

    // 4. Clean up used OTP? (Optional, maybe delete or mark used)
    diesel::delete(otp_metadata::table.filter(otp_metadata::email.eq(&payload.email)))
        .execute(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(AuthResponse {
        message: "Login successful".to_string(),
        token: Some(token),
        user: Some(UserResponse {
            id: user.id,
            email: user.email,
        }),
    }))
}
