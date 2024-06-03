import { Stage } from "./constants";
import { Function, Handler } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { AuthorizationType, IdentitySource, JsonSchemaType, LambdaIntegration, RequestAuthorizer, RestApi, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";

export interface ApiGatewayConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;

    /** The lambda function handling OAuth flow. */
    readonly oauthLambda: Function;

    /** The lambda function handling API authorization. */
    readonly apiAuthorizerLambda: Function;

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

        /**
         * Lambda integrations for the different processes.
         */
        const oauthLambdaIntegration = new LambdaIntegration(props.oauthLambda);
        const apiHandlerLambdaIntegration = new LambdaIntegration(props.apiHandlerLambda, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });

        /**
         * OAuth redirect URI for account linking. 
         */
        const redirectUriResource = api.root.addResource('auth').addResource('callback');
        redirectUriResource.addMethod('GET', oauthLambdaIntegration);

        /**
         * Authorizer for API. 
         */
        const authorizer = new RequestAuthorizer(this, 'APIAuthorizer', {
            handler: props.apiAuthorizerLambda,
            identitySources: [IdentitySource.header('Authorization')]
        });

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

        usersResource.addMethod('POST', apiHandlerLambdaIntegration, {
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

        userIdResource.addMethod('GET', apiHandlerLambdaIntegration, {
            authorizationType: AuthorizationType.CUSTOM,
            authorizer: authorizer,
            methodResponses: [
                // TODO
            ]
        });
    }
}