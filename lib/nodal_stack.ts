import { App, Environment, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { STACK_PREFIX, Stage } from "./constants";
import { LambdaConstruct } from "./lambda";
import { StorageConstruct } from "./storage";
import { ApiGatewayConstruct } from "./api_gateway";

export interface NodalStackProps extends StackProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;
}

export class NodalStack extends Stack {
    constructor(scope: Construct, id: string, props: NodalStackProps) {
        super(scope, id, props);

        const lambdaConstruct = new LambdaConstruct(this, `${STACK_PREFIX}-Lambdas-${props.stage}`, {
            stage: props.stage,
        });

        const storageConstruct = new StorageConstruct(this, `${STACK_PREFIX}-Storage-${props.stage}`, {
            stage: props.stage,
            lambda: lambdaConstruct.apiHandlerLambda,
        });

        const apiGatewayConstruct = new ApiGatewayConstruct(this, `${STACK_PREFIX}-ApiGateway-${props.stage}`, {
            stage: props.stage,
            oauthLambda: lambdaConstruct.oauthLambda,
            apiHandlerLambda: lambdaConstruct.apiHandlerLambda,
        });
    }
}