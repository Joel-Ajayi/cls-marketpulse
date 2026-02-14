use axum::http::StatusCode;
use diesel::{
    r2d2::{ConnectionManager, PooledConnection},
    PgConnection, RunQueryDsl,
};
pub mod connect;
pub mod models;
pub mod schema;

use crate::db::models::{NewCategory, NewUnit};
use schema::categories;

// Seed Categories
const DEFAULT_CATEGORIES: [&str; 7] = [
    "Grains",
    "Tubers",
    "Vegetables",
    "Fruits",
    "Protein",
    "Spices",
    "Oils",
];

const DEFAULT_UNITS: [&str; 8] = [
    "Kg",
    "Bag",
    "Basket",
    "Paint Bucket",
    "Tuber",
    "Bunch",
    "Litre",
    "Unit",
];

pub fn seed_user_defaults(
    conn: &mut PooledConnection<ConnectionManager<PgConnection>>,
    user_id: uuid::Uuid,
) -> Result<(), (StatusCode, String)> {
    let new_categories: Vec<NewCategory> = DEFAULT_CATEGORIES
        .into_iter()
        .map(|name| NewCategory { user_id, name })
        .collect();

    diesel::insert_into(categories::table)
        .values(&new_categories)
        .execute(conn)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to seed categories: {}", e),
            )
        })?;

    let new_units: Vec<NewUnit> = DEFAULT_UNITS
        .into_iter()
        .map(|name| NewUnit { user_id, name })
        .collect();

    diesel::insert_into(crate::db::schema::units::table)
        .values(&new_units)
        .execute(conn)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to seed units: {}", e),
            )
        })?;

    Ok(())
}
