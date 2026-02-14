.PHONY: setup migrate redo sync

# Diesel CLI automatically looks for DATABASE_URL in the .env file
setup:
	diesel setup

generate-sql:
	diesel migration generate --diff-schema create_pulses

# Apply the generated SQL to the DB
migrate:
	diesel migration run

init:
	@$(MAKE) setup
	@$(MAKE) generate-sql
	@$(MAKE) migrate
	@echo "✅ Database initialized and synced with Rust schema!"
