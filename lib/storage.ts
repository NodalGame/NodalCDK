import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Stage } from "./constants";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Function } from "aws-cdk-lib/aws-lambda";

export interface StorageConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;

    /** The lambda function interfacing with storage. */
    readonly lambda: Function;
}

export class StorageConstruct extends Construct {
    readonly usersTable: Table;
    readonly userProgressTable: Table;

    constructor(scope: Construct, id: string, props: StorageConstructProps) {
        super(scope, id);

        /**
         * Dynamo table for mapping users' platform specific id to global id. 
         */
        this.usersTable = new Table(this, `Users-${props.stage}`, {
            partitionKey: { name: 'globalId', type: AttributeType.STRING },
            tableName: `Users-${props.stage}`,
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });
    
        /**
         * Dynamo table for storing users' progress and completion status for puzzles. 
         */
        this.userProgressTable = new Table(this, `UserProgress-${props.stage}`, {
            partitionKey: { name: 'userId', type: AttributeType.STRING },
            sortKey: { name: 'puzzleId', type: AttributeType.STRING },
            tableName: `UserProgress-${props.stage}`,
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });
    }
}