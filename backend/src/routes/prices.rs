use crate::handlers::prices::{add_price, get_history};
use crate::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(add_price))
        .route("/history/:item_id", get(get_history))
}
