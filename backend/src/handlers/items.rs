use crate::db::connect::get_connection;
use crate::db::models::{Category, Item, NewItem, PriceEntry};
use crate::db::schema::{categories, items, price_entries};
use crate::middleware::CurrentUser;
use crate::AppState;
use axum::{
    extract::{Multipart, Path, Query, State},
    http::StatusCode,
    Extension, Json,
};
use base64::{engine::general_purpose, Engine as _};
use diesel::prelude::*;
use diesel::OptionalExtension;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Debug)]
pub struct ItemResponse {
    pub id: Uuid,
    pub name: String,
    pub category_name: String,
    pub image: Option<String>,
    pub current_price: Option<i64>,
    pub previous_price: Option<i64>,
    pub unit: Option<String>,
}

pub async fn list_items(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<Vec<ItemResponse>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    // Join items with categories to get category name
    let results = items::table
        .inner_join(categories::table)
        .filter(items::user_id.eq(user.id))
        .select((items::all_columns, categories::name))
        .load::<(Item, String)>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut response = Vec::new();

    for (item, cat_name) in results {
        // Fetch latest 2 prices
        let prices: Vec<(PriceEntry, String)> = price_entries::table
            .inner_join(crate::db::schema::units::table)
            .filter(price_entries::item_id.eq(item.id))
            .order(price_entries::created_at.desc())
            .limit(2)
            .select((price_entries::all_columns, crate::db::schema::units::name))
            .load::<(PriceEntry, String)>(&mut conn)
            .unwrap_or_default();

        let current = prices.first();
        let previous = prices.get(1);

        response.push(ItemResponse {
            id: item.id,
            name: item.name,
            category_name: cat_name,
            image: Some(item.image_path),
            current_price: current.map(|(p, _)| p.price),
            previous_price: previous.map(|(p, _)| p.price),
            unit: current.map(|(_, u)| u.clone()),
        });
    }

    println!("Response: {:?}", response);

    Ok(Json(response))
}

#[derive(Deserialize)]
pub struct CreateItemParams {
    pub name: String,
    pub category_id: Uuid,
}

pub async fn create_item(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    mut multipart: Multipart,
) -> Result<Json<Uuid>, (StatusCode, String)> {
    let mut name = String::new();
    let mut category_id = Uuid::nil();
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
        }
    }

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

    // Ensure category belongs to user? Or global categories? 
    // Assuming categories are user specific based onschema.
    // Check if category exists and belongs to user
    let category_exists = categories::table
        .filter(categories::id.eq(category_id))
        .filter(categories::user_id.eq(user.id))
        .first::<Category>(&mut conn)
        .optional()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if category_exists.is_none() {
         return Err((StatusCode::BAD_REQUEST, "Category not found or does not belong to user".to_string()));
    }

    let new_item = diesel::insert_into(items::table)
        .values(NewItem {
            name: &name,
            category_id,
            user_id: user.id,
            image_path: &image_data,
        })
        .get_result::<Item>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(new_item.id))
}

pub async fn update_item(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
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
    
    // Ensure item belongs to user
    let target = items::table
        .filter(items::id.eq(item_id))
        .filter(items::user_id.eq(user.id));

    // Dynamic update based on what's provided
    if let Some(n) = name {
        diesel::update(target.clone())
            .set(items::name.eq(n))
            .execute(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    if let Some(c) = category_id {
        // Verify new category belongs to user
         let category_exists = categories::table
            .filter(categories::id.eq(c))
            .filter(categories::user_id.eq(user.id))
            .first::<Category>(&mut conn)
            .optional()
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
        if category_exists.is_none() {
             return Err((StatusCode::BAD_REQUEST, "Category not found or does not belong to user".to_string()));
        }

        diesel::update(target.clone())
            .set(items::category_id.eq(c))
            .execute(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    if let Some(img) = image_data {
        diesel::update(target.clone())
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
    Extension(user): Extension<CurrentUser>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<ItemResponse>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let search_pattern = format!("%{}%", params.q);

    let results = items::table
        .inner_join(categories::table)
        .filter(items::name.ilike(&search_pattern))
        .filter(items::user_id.eq(user.id))
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
            current_price: None, // Optimization: skip prices for search
            previous_price: None,
            unit: None,
        })
        .collect();

    Ok(Json(response))
}

pub async fn get_item(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<ItemResponse>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let (item, cat_name) = items::table
        .find(id)
        .inner_join(categories::table)
        .filter(items::user_id.eq(user.id))
        .select((items::all_columns, categories::name))
        .first::<(Item, String)>(&mut conn)
        .map_err(|e| (StatusCode::NOT_FOUND, format!("Item not found: {}", e)))?;

    // Fetch latest 2 prices
    let prices: Vec<(PriceEntry, String)> = price_entries::table
        .inner_join(crate::db::schema::units::table)
        .filter(price_entries::item_id.eq(item.id))
        .order(price_entries::created_at.desc())
        .limit(2)
        .select((price_entries::all_columns, crate::db::schema::units::name))
        .load::<(PriceEntry, String)>(&mut conn)
        .unwrap_or_default();

    let current = prices.first();
    let previous = prices.get(1);

    let res = ItemResponse {
        id: item.id,
        name: item.name,
        category_name: cat_name,
        image: Some(item.image_path),
        current_price: current.map(|(p, _)| p.price),
        previous_price: previous.map(|(p, _)| p.price),
        unit: current.map(|(_, u)| u.clone()),
    };

    Ok(Json(res))
}

pub async fn delete_item(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    // 1. Check ownership
    let item_exists = items::table
        .find(id)
        .filter(items::user_id.eq(user.id))
        .first::<Item>(&mut conn)
        .optional()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if item_exists.is_none() {
        return Err((StatusCode::NOT_FOUND, "Item not found or unauthorized".to_string()));
    }

    // 2. Delete associated price entries first (manual cascade to be safe)
    diesel::delete(price_entries::table.filter(price_entries::item_id.eq(id)))
        .execute(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 3. Delete the item
    diesel::delete(items::table.filter(items::id.eq(id)))
        .execute(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}
