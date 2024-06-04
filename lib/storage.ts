import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Stage } from "./constants";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Repository } from "aws-cdk-lib/aws-ecr";

export interface StorageConstructProps {
    /** The stage of this stack (dev, beta, prod). */
    readonly stage: Stage;
}

export class StorageConstruct extends Construct {
    readonly usersTable: Table;
    readonly itchAuthTable: Table;
    readonly userProgressTable: Table;
    
    readonly lambdaDockerRepo: Repository;

    constructor(scope: Construct, id: string, props: StorageConstructProps) {
        super(scope, id);

        /**
         * Dynamo table for mapping users' platform specific id to global id. 
         */
        this.usersTable = new Table(this, `Users-${props.stage}`, {
            partitionKey: { name: 'userGlobalId', type: AttributeType.STRING },
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });

        /**
         * Dynamo table for storing Itch OAuth info.
         */
        this.itchAuthTable = new Table(this, `ItchAuth-${props.stage}`, {
            partitionKey: { name: 'userGlobalId', type: AttributeType.STRING },
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });
    
        /**
         * Dynamo table for storing users' progress and completion status for puzzles. 
         */
        this.userProgressTable = new Table(this, `UserProgress-${props.stage}`, {
            partitionKey: { name: 'userId', type: AttributeType.STRING },
            sortKey: { name: 'puzzleId', type: AttributeType.STRING },
            removalPolicy: props.stage == Stage.DEV ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        });
    }
}