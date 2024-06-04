use aws_lambda_events::event::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use lambda_runtime::{service_fn, LambdaEvent, Error};
use serde::{Deserialize, Serialize};
use reqwest::{header::HeaderMap, Client};

#[derive(Deserialize)]
struct QueryStringParameters {
    code: String,
    state: String,
}

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    refresh_token: String,
    expires_in: u64,
}

#[derive(Deserialize)]
struct UserResponse {
    id: u64,
    username: String,
}

#[derive(Serialize)]
struct ResponseBody {
    user_id: u64,
    username: String,
}

async fn function_handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let client_id = std::env::var("CLIENT_ID").expect("CLIENT_ID must be set");
    let client_secret = std::env::var("CLIENT_SECRET").expect("CLIENT_SECRET must be set");
    let redirect_uri = std::env::var("REDIRECT_URI").expect("REDIRECT_URI must be set");

    let mut code: String = "".to_owned();
    let mut state: String = "".to_owned();

    event.payload.query_string_parameters.iter().for_each(|(k, v)| {
        match k {
            "code" => code = v.to_string(),
            "state" => state = v.to_string(),
            _ => (),
        }
    });

    let global_id: Option<String> = if !state.is_empty() { Some(state) } else { None };
    let client = Client::new();

    // Trade auth code for token
    let token_response: TokenResponse = client.post("https://itch.io/api/1/oauth/token")
        .form(&[
            ("client_id", &client_id),
            ("client_secret", &client_secret),
            ("code", &code),
            ("grant_type", &"authorization_code".to_string()),
            ("redirect_uri", &redirect_uri),
        ])
        .send()
        .await?
        .json()
        .await?;

    // Get user ID in itch
    let user_response: UserResponse = client.get("https://itch.io/api/1/key/me")
        .bearer_auth(&token_response.access_token)
        .send()
        .await?
        .json()
        .await?;

    associate_user(global_id, &user_response).await;

    let response_body = ResponseBody {
        user_id: user_response.id,
        username: user_response.username,
    };

    let response = ApiGatewayProxyResponse {
        status_code: 200,
        body: Some(aws_lambda_events::encodings::Body::Text(serde_json::to_string(&response_body)?)),
        headers: HeaderMap::new(),
        multi_value_headers: HeaderMap::new(),
        is_base64_encoded: Some(false),
    };

    Ok(response)
}

async fn associate_user(global_id: Option<String>, user: &UserResponse) {
    // Implement your logic to associate the global ID with the Itch.io user ID
    if global_id.is_some() {
        println!("Associating global ID {} with Itch.io user ID {} ({})", global_id.unwrap(), user.id, user.username);
    } else {
        println!("No global ID to associate with Itch.io user ID {} ({})", user.id, user.username);
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let func = service_fn(function_handler);
    lambda_runtime::run(func).await?;
    Ok(())
}
