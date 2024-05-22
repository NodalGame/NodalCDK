use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    let target_dir = env::var("CARGO_TARGET_DIR").unwrap_or_else(|_| "target".to_string());
    let output = PathBuf::from(&target_dir).join("x86_64-unknown-linux-musl").join("release").join("bootstrap");
    let dest = PathBuf::from(&target_dir).join("x86_64-unknown-linux-musl").join("release").join("bootstrap");

    println!("Output path: {:?}", output);
    println!("Destination path: {:?}", dest);

    // Ensure the target directory exists
    fs::create_dir_all(dest.parent().unwrap()).expect("Failed to create target directory");

    if output.exists() {
        fs::copy(&output, &dest).expect("Failed to copy binary to bootstrap");
    } else {
        panic!("Expected output binary does not exist: {:?}", output);
    }
}
