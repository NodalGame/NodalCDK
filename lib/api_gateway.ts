import { Stage } from "./constants";
import { Function, Handler } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { AuthorizationType, JsonSchemaType, LambdaIntegration, RestApi, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";

export interface ApiGatewayConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;

    /** The lambda function handling authorization requests. */
    readonly oauthLambda: Function;

    /** The lambda function handling API requests. */
    readonly apiHandlerLambda: Function;
}

export class ApiGatewayConstruct extends Construct {
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
        super(scope, id);

        /**
         * Rest APIs for the game. 
         */
        const api = new RestApi(this, `ApiGateway-${props.stage}`, {
            restApiName: `ApiGateway-${props.stage}`,
        });

        const lambdaIntegration = new LambdaIntegration(props.apiHandlerLambda, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });

        /**
         * Authorizer for API. 
         */
        const authorizer = new TokenAuthorizer(this, `TokenAuthorizer-${props.stage}`, {
            handler: props.oauthLambda,
        });

        /**
         * OAuth redirect URI for account linking. 
         */
        const redirectUriResource = api.root.addResource('auth').addResource('callback');

        /**
         * API resources and models for user management. 
         */
        const usersResource = api.root.addResource('users');

        const userUpdateModel = api.addModel('UserUpdateModel', {
            contentType: 'application/json',
            modelName: 'UserUpdate',
            schema: {
                type: JsonSchemaType.OBJECT,
                properties: {
                    globalAccountId: { type: JsonSchemaType.STRING },
                    platformAccountId: { type: JsonSchemaType.STRING },
                    platform: { type: JsonSchemaType.STRING },
                },
                // Global account ID is not required, since this may be first-time account creation for a user. 
                required: ['platformAccountId', 'platform']
            }
        });

        usersResource.addMethod('POST', lambdaIntegration, {
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: authorizer,
            requestModels: {
                'application/json': userUpdateModel,
            },
            methodResponses: [
                // TODO
            ]
        });

        const userIdResource = usersResource.addResource('{userId}');

        userIdResource.addMethod('GET', lambdaIntegration, {
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: authorizer,
            methodResponses: [
                // TODO
            ]
        });
    }
}