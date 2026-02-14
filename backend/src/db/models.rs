use super::schema::{categories, items, otp_metadata, price_entries, units, users};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser<'a> {
    pub email: &'a str,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = categories)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Category {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = categories)]
pub struct NewCategory<'a> {
    pub user_id: Uuid,
    pub name: &'a str,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = units)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Unit {
    pub id: Uuid,
    pub name: String,
    pub user_id: Uuid,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = units)]
pub struct NewUnit<'a> {
    pub user_id: Uuid,
    pub name: &'a str,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = items)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Item {
    pub id: Uuid,
    pub user_id: Uuid,
    pub category_id: Uuid,
    pub name: String,
    pub image_path: String,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = items)]
pub struct NewItem<'a> {
    pub user_id: Uuid,
    pub category_id: Uuid,
    pub name: &'a str,
    pub image_path: &'a str,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = price_entries)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PriceEntry {
    pub id: Uuid,
    pub item_id: Uuid,
    pub unit_id: Uuid,
    pub price: i64,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = price_entries)]
pub struct NewPriceEntry {
    pub item_id: Uuid,
    pub unit_id: Uuid,
    pub price: i64,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = otp_metadata)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct OtpMetadata {
    pub id: Uuid,
    pub email: String,
    pub code: String,
    pub expires_at: NaiveDateTime,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = otp_metadata)]
pub struct NewOtpMetadata<'a> {
    pub email: &'a str,
    pub code: &'a str,
    pub expires_at: NaiveDateTime,
}
