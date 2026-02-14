-- Your SQL goes here
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "users"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" TEXT NOT NULL UNIQUE,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "otp_metadata"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" TEXT NOT NULL,
	"code" TEXT NOT NULL,
	"expires_at" TIMESTAMP NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "categories"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" UUID NOT NULL,
	"name" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "units"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" TEXT NOT NULL,
	"user_id" UUID NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE "items"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" UUID NOT NULL,
	"category_id" UUID NOT NULL,
	"name" TEXT NOT NULL,
	"image_path" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
	FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
);

CREATE TABLE "price_entries"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"item_id" UUID NOT NULL,
	"unit_id" UUID NOT NULL,
	"price" BIGINT NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE,
	FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE
);

