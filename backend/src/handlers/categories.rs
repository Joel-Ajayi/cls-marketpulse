use crate::db::connect::get_connection;
use crate::db::models::{Category, NewCategory};
use crate::db::schema::categories;
use crate::middleware::CurrentUser;
use crate::AppState;
use axum::{
    extract::State,
    http::StatusCode,
    Extension, Json,
};
use diesel::prelude::*;
use serde::Deserialize;

pub async fn list_categories(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<Vec<Category>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let results = categories::table
        .filter(categories::user_id.eq(user.id))
        .order(categories::name.asc())
        .load::<Category>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(results))
}

#[derive(Deserialize)]
pub struct CreateCategoryParams {
    pub name: String,
}

pub async fn create_category(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    Json(params): Json<CreateCategoryParams>,
) -> Result<Json<Category>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let new_category = diesel::insert_into(categories::table)
        .values(NewCategory {
            name: &params.name,
            user_id: user.id,
        })
        .get_result::<Category>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(new_category))
}
