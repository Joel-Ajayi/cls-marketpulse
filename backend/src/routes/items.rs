use axum::{Router, routing::get};
use crate::AppState;
use crate::handlers::items::{list_items, create_item, search_items, update_item};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_items).post(create_item))
        .route("/search", get(search_items))
        .route("/:id", get(list_items).put(update_item)) // Using PUT for updates
}
