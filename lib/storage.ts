import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Stage } from "./common";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface StorageStackProps extends StackProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;
}

export class StorageStack extends Stack {
    readonly usersTable: Table;
    readonly userProgressTable: Table;

    constructor(scope: Construct, id: string, props: StorageStackProps) {
        super(scope, id, props);

        /**
         * Dynamo table for mapping users' platform specific id to global id. 
         */
        this.usersTable = new Table(this, `Users-${props.stage}`, {
            partitionKey: { name: 'globalId', type: AttributeType.STRING },
            tableName: `Users-${props.stage}`,
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });
    
        /**
         * Dynamo table for storing users' completed levels. 
         */
        this.userProgressTable = new Table(this, `UserProgress-${props.stage}`, {
            partitionKey: { name: 'userId', type: AttributeType.STRING },
            sortKey: { name: 'puzzleId', type: AttributeType.STRING },
            tableName: `UserProgress-${props.stage}`,
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });
    }
}