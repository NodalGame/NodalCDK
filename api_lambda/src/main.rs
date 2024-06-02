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

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_runtime::Context;

    #[tokio::test]
    async fn test_function_handler() {
        let payload = json!({});
        let context = Context::default();
        let result = function_handler(payload, context).await;
        assert!(result.is_ok());
        let response = result.unwrap();
        assert_eq!(response["statusCode"], 200);
        assert_eq!(response["body"], "Hello, World!");
    }
}