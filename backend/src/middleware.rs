use crate::{libs::Crypto, AppState};
use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CurrentUser {
    pub id: uuid::Uuid,
}

pub async fn auth_middleware(
    State(_): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let auth_header = if let Some(auth_header) = auth_header {
        auth_header
    } else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    if !auth_header.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let sub = Crypto::validate_jwt(&auth_header[7..]).map_err(|e| e.0)?;

    let user_id = uuid::Uuid::parse_str(&sub).map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Insert user into request extensions
    let user = CurrentUser { id: user_id };
    req.extensions_mut().insert(user);

    Ok(next.run(req).await)
}
