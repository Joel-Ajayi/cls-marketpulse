# Pin the Rust toolchain version used in the build stage.
ARG RUST_VERSION=1.92

# Name of the compiled binary produced by Cargo (must match Cargo.toml package name).
ARG APP_NAME=backend


FROM docker.io/library/rust:${RUST_VERSION}-alpine AS build

# Re-declare args inside the stage if you want to use them here.
ARG APP_NAME

# All build steps happen inside /app.
WORKDIR /app

# Install build dependencies needed to compile Rust crates on Alpine
RUN apk add --no-cache \
    clang \
    lld \
    musl-dev \
    git \
    pkgconfig \
    openssl-dev \
    openssl-libs-static \
    strit-dev \
    zlib-dev \
    postgresql-dev

ENV OPENSSL_STATIC=1
ENV OPENSSL_LIB_DIR=/usr/lib
ENV OPENSSL_INCLUDE_DIR=/usr/include

# Build the application 
RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo build --locked --release && \
    cp ./target/release/$APP_NAME /bin/server

FROM docker.io/library/alpine:3.18 AS final

RUN apk add --no-cache libssl3 libcrypto3 libpq ca-certificates

# Create a non-privileged user (recommended best practice)
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Drop privileges for runtime.
USER appuser

# Copy only the compiled binary from the build stage.
COPY --from=build /bin/server /bin/

# Document the port your app listens on.
EXPOSE 8000

# Start the application.
CMD ["/bin/server"]