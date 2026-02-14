use crate::handlers::auth::{request_otp, verify_otp};
use crate::AppState;
use axum::{routing::post, Router};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/request-otp", post(request_otp))
        .route("/verify-otp", post(verify_otp))
}
