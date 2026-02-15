use axum::http::StatusCode;
use diesel::{
    r2d2::{ConnectionManager, PooledConnection},
    PgConnection, RunQueryDsl,
};
pub mod connect;
pub mod models;
pub mod schema;

use crate::db::models::{Category, Item, NewCategory, NewItem, NewUnit, Unit};
use chrono::{Duration, Utc};
use schema::{categories, items, price_entries, units};

#[derive(diesel::Insertable)]
#[diesel(table_name = price_entries)]
struct NewPriceEntryWithDate {
    item_id: uuid::Uuid,
    unit_id: uuid::Uuid,
    price: i64,
    created_at: chrono::NaiveDateTime,
}

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

const DEFAULT_UNITS: [&str; 9] = [
    "Kg",
    "Pounds",
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
    // 1. Seed Categories
    let new_categories: Vec<NewCategory> = DEFAULT_CATEGORIES
        .into_iter()
        .map(|name| NewCategory { user_id, name })
        .collect();

    let inserted_categories: Vec<Category> = diesel::insert_into(categories::table)
        .values(&new_categories)
        .get_results(conn)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to seed categories: {}", e),
            )
        })?;

    // 2. Seed Units
    let new_units: Vec<NewUnit> = DEFAULT_UNITS
        .into_iter()
        .map(|name| NewUnit { user_id, name })
        .collect();

    let inserted_units: Vec<Unit> = diesel::insert_into(units::table)
        .values(&new_units)
        .get_results(conn)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to seed units: {}", e),
            )
        })?;

    // Helper to find IDs
    let find_cat = |name: &str| -> Option<uuid::Uuid> {
        inserted_categories.iter().find(|c| c.name == name).map(|c| c.id)
    };
    let find_unit = |name: &str| -> Option<uuid::Uuid> {
        inserted_units.iter().find(|u| u.name == name).map(|u| u.id)
    };

    // 3. Seed Items
    // Ensure required categories exist
    let grains_id = find_cat("Grains").ok_or((
        StatusCode::INTERNAL_SERVER_ERROR,
        "Category 'Grains' not found after seed".to_string(),
    ))?;
    let tubers_id = find_cat("Tubers").ok_or((
        StatusCode::INTERNAL_SERVER_ERROR,
        "Category 'Tubers' not found after seed".to_string(),
    ))?;

    let items_data = vec![
        ("Rice", grains_id),
        ("Yam", tubers_id),
    ];

    let mut seeded_items = Vec::new();

    for (name, category_id) in items_data {
        let new_item = NewItem {
            user_id,
            category_id,
            name,
            image_path: "", 
        };

        let item: Item = diesel::insert_into(items::table)
            .values(&new_item)
            .get_result(conn)
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to seed item '{}': {}", name, e),
                )
            })?;
        seeded_items.push(item);
    }

    // 4. Seed Price History
    // Units: Kg, Bag, Paint Bucket
    let target_units = ["Kg", "Bag", "Paint Bucket"];
    let now = Utc::now().naive_utc();

    for item in seeded_items {
        for unit_name in &target_units {
            if let Some(unit_id) = find_unit(unit_name) {
                // Determine base price based on item and unit
                let base_price = match (item.name.as_str(), *unit_name) {
                    ("Rice", "Kg") => 200000,          // 2,000.00
                    ("Rice", "Bag") => 9000000,        // 90,000.00
                    ("Rice", "Paint Bucket") => 750000,// 7,500.00
                    ("Yam", "Kg") => 150000,           // 1,500.00
                    ("Yam", "Bag") => 6000000,         // 60,000.00
                    ("Yam", "Paint Bucket") => 500000, // 5,000.00
                    _ => 100000,
                };

                let mut entries = Vec::new();
                for i in 0..4 {
                    // Create history: 3 weeks ago, 2 weeks ago, 1 week ago, now
                    // i=0 -> 3 weeks ago
                    // i=3 -> now
                    let weeks_ago = 3 - i;
                    let date = now - Duration::weeks(weeks_ago as i64);
                    
                    // Slightly increase price over time
                    let price = base_price + (i * 50000); // +500.00 per step

                    entries.push(NewPriceEntryWithDate {
                        item_id: item.id,
                        unit_id,
                        price,
                        created_at: date,
                    });
                }

                diesel::insert_into(price_entries::table)
                    .values(&entries)
                    .execute(conn)
                    .map_err(|e| {
                        (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            format!("Failed to seed prices for {}: {}", item.name, e),
                        )
                    })?;
            }
        }
    }

    Ok(())
}
