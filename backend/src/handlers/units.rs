use crate::db::connect::get_connection;
use crate::db::models::{NewUnit, Unit};
use crate::db::schema::units;
use crate::middleware::CurrentUser;
use crate::AppState;
use axum::{
    extract::State,
    http::StatusCode,
    Extension, Json,
};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct UnitResponse {
    pub id: uuid::Uuid,
    pub name: String,
}

pub async fn list_units(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<Vec<UnitResponse>>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let results = units::table
        .filter(units::user_id.eq(user.id))
        .load::<Unit>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let response = results
        .into_iter()
        .map(|u| UnitResponse {
            id: u.id,
            name: u.name,
        })
        .collect();

    Ok(Json(response))
}

#[derive(Deserialize)]
pub struct CreateUnitParams {
    pub name: String,
}

pub async fn create_unit(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    Json(params): Json<CreateUnitParams>,
) -> Result<Json<UnitResponse>, (StatusCode, String)> {
    let mut conn = get_connection(&state.db)?;

    let new_unit = diesel::insert_into(units::table)
        .values(NewUnit {
            name: &params.name,
            user_id: user.id,
        })
        .get_result::<Unit>(&mut conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(UnitResponse {
        id: new_unit.id,
        name: new_unit.name,
    }))
}
