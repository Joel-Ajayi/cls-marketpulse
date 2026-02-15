use axum::{routing::get, Router};
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::PgConnection;
use std::env::var;
use std::net::SocketAddr;
use tokio::net::TcpListener;

mod db;
mod handlers;
mod libs;
mod middleware;
mod routes;
mod services;
// Define App State
#[derive(Clone)]
pub struct AppState {
    pub db: Pool<ConnectionManager<PgConnection>>,
}

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().ok();

    let pool = db::connect::establish_connection_pool();
    
    // Run migrations
    {
        let mut conn = pool.get().expect("Failed to get DB connection from pool");
        conn.run_pending_migrations(MIGRATIONS).expect("Failed to run migrations");
    }

    let state = AppState { db: pool };

    // build our application
    let app = Router::new()
        .route("/", get(handler))
        .nest("/auth", routes::auth::router())
        .nest(
            "/items",
            routes::items::router().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                middleware::auth_middleware,
            )),
        )
        .nest(
            "/prices",
            routes::prices::router().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                middleware::auth_middleware,
            )),
        )
        .nest(
            "/categories",
            routes::categories::router().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                middleware::auth_middleware,
            )),
        )
        .nest(
            "/units",
            routes::units::router().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                middleware::auth_middleware,
            )),
        )
        .with_state(state);

    // run it
    let port = var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr = SocketAddr::from(([127, 0, 0, 1], port.parse().unwrap()));
    println!("listening on {}", addr);
    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handler() -> &'static str {
    "MarketPulse API is running!"
}
