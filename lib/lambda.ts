import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Stage } from "./common";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export interface LambdaStackProps extends StackProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;
}

export class LambdaStack extends Stack {
    readonly lambda: Function;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);
    
        /**
         * Lambda function that handles the API requests.
         */
        this.lambda = new Function(this, `Lambda-${props.stage}`, {
            runtime: Runtime.PROVIDED_AL2,
            code: Code.fromAsset(path.join(__dirname, '../lambda/target/x86_64-unknown-linux-musl/release')),
            handler: 'bootstrap',
            memorySize: 128,
            timeout: Duration.seconds(10),
        });
    }
}