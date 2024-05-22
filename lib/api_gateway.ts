import { Stack, StackProps } from "aws-cdk-lib";
import { Stage } from "./common";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";

export interface ApiGatewayStackProps extends StackProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;

    /** The lambda function handling API requests. */
    readonly lambda: Function;
}

export class ApiGatewayStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
        super(scope, id, props);

        /**
         * Rest APIs for the game. 
         */
        const api = new RestApi(this, `ApiGateway-${props.stage}`, {
            restApiName: `ApiGateway-${props.stage}`,
        });

        const lambdaIntegration = new LambdaIntegration(props.lambda, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });

        /** TODO remove this resource after testing finishes. */
        const testResource = api.root.addResource('test');
        testResource.addMethod('GET', lambdaIntegration);
    }
}