use crate::db::connect::get_connection;
use crate::db::models::{NewPriceEntry, PriceEntry, Unit};
use crate::db::schema::{items, price_entries, units};
use crate::AppState;
use axum::extract::{Path, State};
use axum::{http::StatusCode, Json};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreatePriceEntryPayload {
    pub item_id: Uuid,
    pub unit_id: Uuid,
    pub category_id: Option<Uuid>,
    pub price: f64, // Input as Naira (float)
}

pub async fn add_price(
    State(state): State<AppState>,
    Json(payload): Json<CreatePriceEntryPayload>,
) -> Result<Json<String>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    // 1. Add Price Entry
    diesel::insert_into(price_entries::table)
        .values(NewPriceEntry {
            item_id: payload.item_id,
            unit_id: payload.unit_id,
            price: (payload.price * 100.0) as i64,
        })
        .execute(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 2. Update Item's Default Unit (and Category if provided)

    let target = items::table.filter(items::id.eq(payload.item_id));

    if let Some(cat_id) = payload.category_id {
        diesel::update(target)
            .set((items::category_id.eq(cat_id),))
            .execute(&mut conn)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    Ok(Json(
        "Price added and item updated successfully".to_string(),
    ))
}

#[derive(Serialize)]
pub struct PriceHistoryResponse {
    pub date: String,
    pub unit: String,
    pub price: f64,
}

pub async fn get_history(
    State(state): State<AppState>,
    Path(item_id): Path<Uuid>,
) -> Result<Json<Vec<PriceHistoryResponse>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let results = price_entries::table
        .inner_join(units::table)
        .filter(price_entries::item_id.eq(item_id))
        .order(price_entries::created_at.asc())
        .select((PriceEntry::as_select(), Unit::as_select()))
        .load::<(PriceEntry, Unit)>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let response = results
        .into_iter()
        .map(|(entry, unit)| PriceHistoryResponse {
            date: entry.created_at.to_string(),
            unit: unit.name,
            price: entry.price as f64 / 100.0,
        })
        .collect();

    Ok(Json(response))
}
