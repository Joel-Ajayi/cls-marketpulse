use axum::{routing::get, Router};
use crate::AppState;
use crate::handlers::units::{create_unit, list_units};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_units).post(create_unit))
}
