use lambda_runtime::{handler_fn, Context, Error};
use serde_json::json;

async fn function_handler(_: serde_json::Value, _: Context) -> Result<serde_json::Value, Error> {
    Ok(json!({
        "statusCode": 200,
        "body": "Hello, World!"
    }))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let func = handler_fn(function_handler);
    lambda_runtime::run(func).await?;
    Ok(())
}
