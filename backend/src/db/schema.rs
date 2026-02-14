// @generated automatically by Diesel CLI.

diesel::table! {
    categories (id) {
        id -> Uuid,
        user_id -> Uuid,
        name -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    items (id) {
        id -> Uuid,
        user_id -> Uuid,
        category_id -> Uuid,
        name -> Text,
        image_path -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    otp_metadata (id) {
        id -> Uuid,
        email -> Text,
        code -> Text,
        expires_at -> Timestamp,
        created_at -> Timestamp,
    }
}

diesel::table! {
    price_entries (id) {
        id -> Uuid,
        item_id -> Uuid,
        unit_id -> Uuid,
        price -> Int8,
        created_at -> Timestamp,
    }
}

diesel::table! {
    units (id) {
        id -> Uuid,
        name -> Text,
        user_id -> Uuid,
        created_at -> Timestamp,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        email -> Text,
        created_at -> Timestamp,
    }
}

diesel::joinable!(categories -> users (user_id));
diesel::joinable!(items -> categories (category_id));
diesel::joinable!(items -> users (user_id));
diesel::joinable!(price_entries -> items (item_id));
diesel::joinable!(price_entries -> units (unit_id));
diesel::joinable!(units -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    categories,
    items,
    otp_metadata,
    price_entries,
    units,
    users,
);
