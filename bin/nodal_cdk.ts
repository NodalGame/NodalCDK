#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { STACK_PREFIX, Stage } from '../lib/constants';
import { NodalStack } from '../lib/nodal_stack';

const app = new cdk.App();
const env = {
    account: "115984396435"
}

if (process.env.STAGE == 'dev') {
    new NodalStack(app, `${STACK_PREFIX}-${Stage.DEV}`, {
        env,
        stage: Stage.DEV,
        terminationProtection: false,
    });
} else if (process.env.STAGE == 'beta') {
    new NodalStack(app, `${STACK_PREFIX}-${Stage.BETA}`, {
        env,
        stage: Stage.BETA,
        terminationProtection: true,
    });
} else if (process.env.STAGE == 'prod') {
    new NodalStack(app, `${STACK_PREFIX}-${Stage.PROD}`, {
        env,
        stage: Stage.PROD,
        terminationProtection: true,
    });
} else {
    throw new Error('Invalid stage, choose one of {dev, beta, prod}.');
}
