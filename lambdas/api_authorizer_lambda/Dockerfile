FROM rust:latest as builder

# Create app directory
WORKDIR /usr/src/myapp

# Install dependencies for building OpenSSL and other packages
RUN apt-get update && \
    apt-get install -y musl-tools musl-dev pkg-config libssl-dev curl \
                       build-essential linux-headers-generic gdb

# Download and compile OpenSSL for musl
RUN curl -O https://www.openssl.org/source/openssl-1.1.1k.tar.gz && \
    tar xzf openssl-1.1.1k.tar.gz && \
    cd openssl-1.1.1k && \
    CC=musl-gcc ./Configure -DOPENSSL_NO_SECURE_MEMORY no-shared no-dso no-asm no-tests no-zlib linux-x86_64 -static --prefix=/usr/local/musl -idirafter /usr/include/ -idirafter /usr/include/x86_64-linux-gnu/ && \
    make && \
    make install_sw

# Set the environment variables for OpenSSL
ENV OPENSSL_DIR=/usr/local/musl
ENV OPENSSL_INCLUDE_DIR=/usr/local/musl/include
ENV OPENSSL_LIB_DIR=/usr/local/musl/lib

# Copy the source code
COPY . .

# Add target
RUN rustup target add x86_64-unknown-linux-musl

# Build the application in release mode
RUN cargo build --release --target x86_64-unknown-linux-musl

# Create a minimal image
FROM alpine:latest

RUN apk --no-cache add ca-certificates gdb

WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/myapp/target/x86_64-unknown-linux-musl/release/bootstrap .

# Ensure the bootstrap file has executable permissions
RUN chmod o+rx /root

CMD ["./bootstrap"]
