#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { STACK_PREFIX, Stage } from '../lib/constants';
import { StorageStack } from '../lib/storage';
import { LambdaStack } from '../lib/lambda';
import { ApiGatewayStack } from '../lib/api_gateway';

const app = new cdk.App();
const env = {
    account: "115984396435"
}

if (process.env.STAGE == 'dev') {
    // Create dev stacks
    createStacks({
        app,
        env,
        stage: Stage.DEV,
    });
} else {
    // Create beta and prod stacks
    createStacks({
        app,
        env,
        stage: Stage.BETA,
    });
    createStacks({
        app,
        env,
        stage: Stage.PROD,
    });
}

interface CommonStackProps {
    app: cdk.App;
    env: cdk.Environment;
    stage: Stage;
}

function createStacks(props: CommonStackProps) {
    const storageStack = new StorageStack(props.app, `${STACK_PREFIX}-StorageStack-${props.stage}`, {
        env: props.env,
        stage: props.stage,
    });

    const lambdaStack = new LambdaStack(props.app, `${STACK_PREFIX}-LambdaStack-${props.stage}`, {
        env: props.env,
        stage: props.stage,
    });

    const apiGatewayStack = new ApiGatewayStack(props.app, `${STACK_PREFIX}-ApiGatewayStack-${props.stage}`, {
        env: props.env,
        stage: props.stage,
        lambda: lambdaStack.lambda,
    });
}