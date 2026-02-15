ARG RUST_VERSION=1.92
ARG APP_NAME=backend

FROM docker.io/library/rust:${RUST_VERSION}-slim-bookworm AS build
ARG APP_NAME
WORKDIR /app

# Install Debian build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    perl \
    make \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Build the application
RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo build --locked --release && \
    cp ./target/release/$APP_NAME /bin/server

# STEP 2: Use 'debian-slim' for the final image
FROM debian:bookworm-slim AS final

# Install runtime libraries for Postgres and SSL
RUN apt-get update && apt-get install -y \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

USER appuser
COPY --from=build /bin/server /bin/

ENV ROCKET_ADDRESS=0.0.0.0
EXPOSE 8000

CMD ["/bin/server"]
