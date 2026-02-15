use axum::{routing::get, Router};
use crate::AppState;
use crate::handlers::categories::{create_category, list_categories};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_categories).post(create_category))
}
