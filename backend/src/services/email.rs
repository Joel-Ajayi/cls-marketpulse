use axum::http::{Error, StatusCode};
use dotenvy::dotenv;
use resend_rs::{types::CreateEmailBaseOptions, Resend};

pub async fn send_email(to: &str, subject: &str, body: String) -> Result<(), (StatusCode, String)> {
    // dotenv is loaded in main.rs

    let resend = Resend::default();

    let from = "Acme <onboarding@yotstack.tech>";
    let to = [to];

    let email = CreateEmailBaseOptions::new(from, to, subject).with_html(&body);

    let _email = resend
        .emails
        .send(email)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()));

    Ok(())
}
