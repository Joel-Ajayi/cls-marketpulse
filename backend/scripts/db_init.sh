#!/bin/bash

# 1. Load .env variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ .env variables loaded"
else
    echo "❌ .env file not found"
    exit 1
fi

# 2. Command Logic
case "$1" in
    redo)
        diesel migration redo
        ;;
    sync)
        diesel print-schema > ../src/db/schema.rs
        ;;
    migrate)
        diesel migration run
        echo "🚀 Database Migrated!"
        ;;
    init)
        diesel setup
        diesel migration generate --diff-schema create_pulses
        echo "🚀 Database Initialized!"
        ;;
    *)
        echo "Usage: ./scripts/db_init.sh {init}"
        exit 1
        ;;
esac
