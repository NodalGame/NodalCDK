import { Duration } from "aws-cdk-lib";
import { REDIRECT_URI_DEV, Stage } from "./constants";
import { DockerImageCode, DockerImageFunction, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { DockerImageName, ECRDeployment } from "cdk-ecr-deployment";

export interface LambdaConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;

    /** The ECR repo to store the lambdas. */

    /** The users table. */
    readonly usersTable: Table;

    /** The Itch.io auth table. */
    readonly itchAuthTable: Table;
}

export class LambdaConstruct extends Construct {
    readonly oauthLambda: Function;
    readonly apiAuthorizerLambda: Function;
    readonly apiHandlerLambda: Function;

    constructor(scope: Construct, id: string, props: LambdaConstructProps) {
        super(scope, id);

        let redirect_uri: string;
        switch(props.stage) {
            case Stage.DEV: redirect_uri = REDIRECT_URI_DEV;
            case Stage.BETA: redirect_uri = '';
            case Stage.PROD: redirect_uri = '';
        };

        /**
         * Lambda function that handles the OAuth process.
         */
        this.oauthLambda = new DockerImageFunction(this, `OAuthLambda-${props.stage}`, {
            code: DockerImageCode.fromImageAsset(path.join(__dirname, '../lambdas/oauth_lambda')),
            memorySize: 128,
            timeout: Duration.seconds(10),
            environment: {
                ITCH_CLIENT_ID: process.env.ITCH_CLIENT_ID!,
                ITCH_CLIENT_SECRET: process.env.ITCH_CLIENT_SECRET!,
                ITCH_AUTH_TABLE_NAME: props.itchAuthTable.tableName,
                USERS_TABLE_NAME: props.usersTable.tableName,
                REDIRECT_URI: redirect_uri,
            },
        });

        props.usersTable.grantReadWriteData(this.oauthLambda);
        props.itchAuthTable.grantReadWriteData(this.oauthLambda);
    
        /**
         * Lambda function that handles authorization for API requests.  
         */
        this.apiAuthorizerLambda = new DockerImageFunction(this, `ApiAuthorizerLambda-${props.stage}`, {
            code: DockerImageCode.fromImageAsset(path.join(__dirname, '../lambdas/api_authorizer_lambda')),
            memorySize: 128,
            timeout: Duration.seconds(10),
            environment: {
                ITCH_CLIENT_ID: process.env.ITCH_CLIENT_ID!,
            }
        });

        /**
         * Lambda function that handles the API requests.
         */
        this.apiHandlerLambda = new DockerImageFunction(this, `ApiLambda-${props.stage}`, {
            code: DockerImageCode.fromImageAsset(path.join(__dirname, '../lambdas/api_lambda')),
            memorySize: 128,
            timeout: Duration.seconds(10),
        });
    }
}