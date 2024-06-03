import { Duration } from "aws-cdk-lib";
import { ITCH_AUTH_DOMAIN, ITCH_CLIENT_ID_DEV, REDIRECT_URI_DEV, Stage } from "./constants";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export interface LambdaConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;
}

export class LambdaConstruct extends Construct {
    readonly oauthLambda: Function;
    readonly apiAuthorizerLambda: Function;
    readonly apiHandlerLambda: Function;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);

        let client_id: string; 
        switch(props.stage) {
            case Stage.DEV: client_id = ITCH_CLIENT_ID_DEV;
            case Stage.BETA: client_id = '';
            case Stage.PROD: client_id = '';
        };

        let redirect_uri: string;
        switch(props.stage) {
            case Stage.DEV: redirect_uri = REDIRECT_URI_DEV;
            case Stage.BETA: redirect_uri = '';
            case Stage.PROD: redirect_uri = '';
        };

        /**
         * Lambda function that handles the OAuth process.
         */
        this.oauthLambda = new Function(this, `OAuthLambda-${props.stage}`, {
            runtime: Runtime.NODEJS_20_X,
            code: Code.fromAsset(path.join(__dirname, '../lambdas/oauth_lambda')),
            handler: 'index.handler',
            memorySize: 128,
            timeout: Duration.seconds(10),
            environment: {
                AUTH_DOMAIN: ITCH_AUTH_DOMAIN,
                CLIENT_ID: client_id,
                REDIRECT_URI: redirect_uri,
            }
        });
    
        /**
         * Lambda function that handles authorization for API requests.  
         */
        this.apiAuthorizerLambda = new Function(this, `ApiAuthorizerLambda-${props.stage}`, {
            runtime: Runtime.NODEJS_20_X,
            code: Code.fromAsset(path.join(__dirname, '../lambdas/api_authorizer_lambda')),
            handler: 'index.handler',
            memorySize: 128,
            timeout: Duration.seconds(10),
            environment: {
                AUTH_DOMAIN: ITCH_AUTH_DOMAIN,
                CLIENT_ID: client_id,
            }
        });

        /**
         * Lambda function that handles the API requests.
         */
        this.apiHandlerLambda = new Function(this, `ApiLambda-${props.stage}`, {
            runtime: Runtime.PROVIDED_AL2,
            code: Code.fromAsset(path.join(__dirname, '../lambdas/api_lambda/target/x86_64-unknown-linux-gnu/release')),
            handler: 'bootstrap',
            memorySize: 128,
            timeout: Duration.seconds(10),
        });
    }
}