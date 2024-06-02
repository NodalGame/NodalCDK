import { Duration } from "aws-cdk-lib";
import { Stage } from "./constants";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export interface LambdaConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;
}

export class LambdaConstruct extends Construct {
    readonly oauthLambda: Function;
    readonly apiHandlerLambda: Function;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);
    
        /**
         * Lambda function that handles authorization for API requests.  
         */
        this.oauthLambda = new Function(this, `OAuthLambda-${props.stage}`, {
            runtime: Runtime.NODEJS_20_X,
            code: Code.fromAsset(path.join(__dirname, '../oauth_lambda')),
            handler: 'index.handler',
            memorySize: 128,
            timeout: Duration.seconds(10),
        });

        /**
         * Lambda function that handles the API requests.
         */
        this.apiHandlerLambda = new Function(this, `Lambda-${props.stage}`, {
            runtime: Runtime.PROVIDED_AL2,
            code: Code.fromAsset(path.join(__dirname, '../api_lambda/target/x86_64-unknown-linux-gnu/release')),
            handler: 'bootstrap',
            memorySize: 128,
            timeout: Duration.seconds(10),
        });
    }
}