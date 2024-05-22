# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Development

1. Build the lambda package navigate to `/lambda/` and run `cargo lambda build --release`.
2. Set environment variable `STAGE` to "dev", as this will be used for deploying your personal stack to test with. 
3. Run `aws configure` with your public and secret AWS access key. 
4. Start using the Useful Commands to play around! 