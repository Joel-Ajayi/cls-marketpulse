use axum::{Router, routing::get};
use crate::AppState;
use crate::handlers::items::{create_item, list_items, search_items, update_item, get_item, delete_item};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_items).post(create_item))
        .route("/search", get(search_items))
        // .route("/export", get(export_items)) // TODO: Implement export
        .route("/:id", get(get_item).put(update_item).delete(delete_item))
}
