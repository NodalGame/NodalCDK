use std::{error::Error, process::exit};

use lambda_http::{
    run, service_fn, tracing::{self, error, info}, Body, Error as LambdaError, Request as LambdaRequest, RequestExt, Response as LambdaResponse
};
use reqwest::{Client as ReqwestClient, Response as ReqwestResponse, Error as ReqwestError};
use aws_sdk_dynamodb::Client as DynamoDbClient;
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
struct ItchUser {
    username: String,
    gamer: bool,
    display_name: String,
    cover_url: String,
    url: String,
    press_user: bool,
    developer: bool,
    id: u64,
}

#[derive(Deserialize)]
struct ItchMeResponse {
    user: ItchUser,
}

/// Retrieves the access token param from the redirect request.
fn get_access_token(event: LambdaRequest) -> String {
    let binding = event.query_string_parameters();
    let access_token_map = binding.all("access_token");
    if access_token_map.is_some() {
        return access_token_map.unwrap().get(0).unwrap().to_owned().to_owned();
    }
    error!("Failed to retrieve code from event params.");
    exit(1);
}

/// Retrieves the "state" param from the redirect request.
/// The state is a "globalId" to associate with the user, if they already
/// have an account. If none present, a globalId will be generated for
/// that user and associated with their first linked account.
fn get_state(event: LambdaRequest) -> Option<String> {
    let binding = event.query_string_parameters();
    let state_map = binding.all("state");
    if state_map.is_some() {
        return Some(state_map.unwrap().get(0).unwrap().to_owned().to_owned());
    }
    info!("Did not find state in event params, will not pair account to existing globalId.");
    None
}

/// Retrieves the user ID from the Itch.io API using the provided access token.
async fn get_itch_user_id(access_token: String) -> Result<String, ReqwestError> {
    let reqwest_client: ReqwestClient = ReqwestClient::new();
    let response: ReqwestResponse = reqwest_client
        .get("https://itch.io/api/1/key/me")
        .bearer_auth(access_token)
        .send()
        .await?;
    if response.status().is_success() {
        let itch_me_response: ItchMeResponse = response.json().await?;
        Ok(itch_me_response.user.id.to_string())
    } else {
        error!("Failed to get user ID from Itch.io: {}", response.status());
        Err(response.error_for_status().unwrap_err())
    }
}

async fn associate_itch_acct_to_user(global_id: String, itch_user_id: String) {
    // TODO implement logic
    info!(
        "Associating global ID {} with Itch.io user ID {}",
        global_id,
        itch_user_id,
    );
}

async fn save_itch_creds(itch_user_id: String, access_token: String) {
    // TODO implement logic
    info!(
        "Saving Itch.io credentials for user ID {} and access token {}",
        itch_user_id,
        access_token,
    );
}

async fn handler(event: LambdaRequest) -> Result<LambdaResponse<Body>, LambdaError> {
    let itch_client_id = std::env::var("ITCH_CLIENT_ID").expect("ITCH_CLIENT_ID must be set");
    let itch_client_secret = std::env::var("ITCH_CLIENT_SECRET").expect("ITCH_CLIENT_SECRET must be set");
    let redirect_uri = std::env::var("REDIRECT_URI").expect("REDIRECT_URI must be set");
    let itch_auth_table_name = std::env::var("ITCH_AUTH_TABLE_NAME").expect("ITCH_AUTH_TABLE_NAME must be set");
    let users_table_name: String = std::env::var("USERS_TABLE_NAME").expect("USERS_TABLE_NAME must be set");

    info!("got lambda request {:?}", event);

    // Get access token from redirect request
    let access_token: String = get_access_token(event.clone());

    // Get user ID in itch
    let itch_user_id: String = match get_itch_user_id(access_token.clone()).await {
        Ok(user_id) => user_id,
        Err(e) => {
            error!("Failed to get user ID from Itch.io: {}", e);
            exit(1);
        }
    };

    // Get global ID from state header. 
    let mut global_id: Option<String> = get_state(event);

    // If global ID didn't exist, generate one.
    if global_id.is_none() {
        global_id = Some(Uuid::new_v4().to_string());
    }
        
    // Associate itch user ID with global ID.
    associate_itch_acct_to_user(global_id.unwrap(), itch_user_id.clone()).await;

    // Save auth credentials. 
    save_itch_creds(itch_user_id, access_token).await;

    let response = LambdaResponse::builder()
        .status(200)
        .header("content-type", "text/html")
        .body("You may now return to the game.".into())
        .map_err(Box::new)?;

    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), LambdaError> {
    // Enable CloudWatch error logs
    tracing::init_default_subscriber();

    run(service_fn(handler)).await
}
