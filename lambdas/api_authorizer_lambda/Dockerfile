FROM rust:latest as builder

# Create app directory
WORKDIR /usr/src/myapp

# Copy the source code
COPY . .

# Add target
RUN rustup target add x86_64-unknown-linux-musl

# Build the application in release mode
RUN cargo build --release --target x86_64-unknown-linux-musl

# Create a minimal image
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/myapp/target/x86_64-unknown-linux-musl/release/bootstrap .

CMD ["./bootstrap"]
