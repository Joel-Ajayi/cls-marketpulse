use axum::http::StatusCode;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::env::var;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
}

pub struct Crypto {}

impl Crypto {
    pub fn otp() -> String {
        const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let mut rng = rand::thread_rng();
        let res: String = (0..6)
            .map(|_| {
                let idx = rng.gen_range(0..CHARSET.len());
                CHARSET[idx] as char
            })
            .collect();

        return res;
    }

    pub fn generate_jwt(sub: String, exp_days: i64) -> Result<String, (StatusCode, String)> {
        let jwt_secret = var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());

        let exp = Utc::now()
            .checked_add_signed(Duration::days(exp_days))
            .expect("valid timestamp")
            .timestamp() as usize;

        let claims = Claims {
            sub,
            exp,
            iat: Utc::now().timestamp() as usize,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(jwt_secret.as_bytes()),
        )
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal Server Error".to_string(),
            )
        })?;

        Ok(token)
    }

    pub fn validate_jwt(token: &str) -> Result<String, (StatusCode, String)> {
        let jwt_secret = var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(jwt_secret.as_bytes()),
            &Validation::new(Algorithm::HS256),
        )
        .map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                "You are not Authorized".to_string(),
            )
        })?;

        Ok(token_data.claims.sub)
    }
}
