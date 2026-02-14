use axum::http::StatusCode;
use diesel::{
    r2d2::{ConnectionManager, Pool, PooledConnection},
    PgConnection,
};

// Define a type alias for convenience
pub type DbPool = Pool<ConnectionManager<PgConnection>>;

pub fn establish_connection_pool() -> DbPool {
    // 1. Get the DB URL from your K8s environment variables
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // 2. Setup the Manager
    let mut manager = ConnectionManager::<PgConnection>::new(db_url);

    // 3. Create the Pool (5-10 connections is standard for a class project)
    Pool::builder()
        .build(manager)
        .expect("Failed to create PostgreSQL connection pool.")
}

pub fn get_connection(
    pool: &DbPool,
) -> Result<PooledConnection<ConnectionManager<PgConnection>>, (StatusCode, String)> {
    let res = pool
        .get()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(res)
}
