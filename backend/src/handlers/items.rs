use crate::db::connect::get_connection;
use crate::db::models::{Category, Item, NewItem};
use crate::db::schema::{categories, items};
use crate::AppState;
use axum::{
    extract::{Multipart, Path, Query, State},
    http::StatusCode,
    Json,
};
use base64::{engine::general_purpose, Engine as _};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize)]
pub struct ItemResponse {
    pub id: Uuid,
    pub name: String,
    pub category_name: String,
    pub image: Option<String>,
}

pub async fn list_items(
    State(state): State<AppState>,
) -> Result<Json<Vec<ItemResponse>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    // Join items with categories to get category name
    let results = items::table
        .inner_join(categories::table)
        .select((items::all_columns, categories::name))
        .load::<(Item, String)>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let response = results
        .into_iter()
        .map(|(item, cat_name)| ItemResponse {
            id: item.id,
            name: item.name,
            category_name: cat_name,
            image: Some(item.image_path),
        })
        .collect();

    Ok(Json(response))
}

#[derive(Deserialize)]
pub struct CreateItemParams {
    pub name: String,
    pub category_id: Uuid,
    pub user_id: Option<Uuid>,
}

pub async fn create_item(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<String>, (StatusCode, String)> {
    let mut name = String::new();
    let mut category_id = Uuid::nil();
    let mut user_id: Option<Uuid> = None;
    let mut image_data: String = String::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        let field_name = field.name().unwrap_or("").to_string();

        if field_name == "image" {
            let content_type = field.content_type().unwrap_or("image/jpeg").to_string();
            let data = field
                .bytes()
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            if data.len() > 3 * 1024 * 1024 {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Image size must be less than 3MB".to_string(),
                ));
            }

            if !data.is_empty() {
                let base64_str = general_purpose::STANDARD.encode(&data);
                image_data = format!("data:{content_type};base64,{base64_str}");
            }
        } else if field_name == "name" {
            name = field
                .text()
                .await
                .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
        } else if field_name == "category_id" {
            let val = field
                .text()
                .await
                .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
            category_id = Uuid::parse_str(&val)
                .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid Category ID".to_string()))?;
        } else if field_name == "user_id" {
            let val = field
                .text()
                .await
                .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
            if !val.is_empty() {
                user_id = Some(
                    Uuid::parse_str(&val)
                        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid User ID".to_string()))?,
                );
            }
        }
    }

    let user_id = user_id.ok_or((
        StatusCode::BAD_REQUEST,
        "User ID is required".to_string(),
    ))?;

    if name.is_empty() || category_id == Uuid::nil() {
        return Err((
            StatusCode::BAD_REQUEST,
            "Name and Category ID are required".to_string(),
        ));
    }

    if image_data.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Image is required".to_string()));
    }

    let mut conn = get_connection(&state.db)?;

    diesel::insert_into(items::table)
        .values(NewItem {
            name: &name,
            category_id,
            user_id,
            image_path: &image_data, // Storing Base64 data here
        })
        .execute(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json("Item created successfully".to_string()))
}

pub async fn update_item(
    State(state): State<AppState>,
    Path(item_id): Path<Uuid>,
    mut multipart: Multipart,
) -> Result<Json<String>, (StatusCode, String)> {
    let mut name: Option<String> = None;
    let mut category_id: Option<Uuid> = None;
    let mut image_data: Option<String> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        let field_name = field.name().unwrap_or("").to_string();

        if field_name == "image" {
            let content_type = field.content_type().unwrap_or("image/jpeg").to_string();
            let data = field
                .bytes()
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            let max_size = 3 * 1024 * 1024;
            if data.len() > max_size {
                return Err((
                    StatusCode::BAD_REQUEST,
                    "Image size must be less than 3MB".to_string(),
                ));
            }

            if !data.is_empty() {
                let base64_str = general_purpose::STANDARD.encode(&data);
                image_data = Some(format!("data:{content_type};base64,{base64_str}"));
            }
        } else if field_name == "name" {
            name = Some(
                field
                    .text()
                    .await
                    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?,
            );
        } else if field_name == "category_id" {
            let val = field
                .text()
                .await
                .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
            category_id = Some(
                Uuid::parse_str(&val)
                    .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid Category ID".to_string()))?,
            );
        }
    }

    let mut conn = get_connection(&state.db)?;
    let target = items::table.filter(items::id.eq(item_id));

    // Dynamic update based on what's provided
    if let Some(n) = name {
        diesel::update(target)
            .set(items::name.eq(n))
            .execute(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    if let Some(c) = category_id {
        diesel::update(target)
            .set(items::category_id.eq(c))
            .execute(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    if let Some(img) = image_data {
        diesel::update(target)
            .set(items::image_path.eq(img))
            .execute(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    Ok(Json("Item updated successfully".to_string()))
}

#[derive(Deserialize)]
pub struct SearchParams {
    pub q: String,
}

pub async fn search_items(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<ItemResponse>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let search_pattern = format!("%{}%", params.q);

    let results = items::table
        .inner_join(categories::table)
        .filter(items::name.ilike(&search_pattern))
        .select((items::all_columns, categories::name))
        .load::<(Item, String)>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let response = results
        .into_iter()
        .map(|(item, cat_name)| ItemResponse {
            id: item.id,
            name: item.name,
            category_name: cat_name,
            image: Some(item.image_path),
        })
        .collect();

    Ok(Json(response))
}
