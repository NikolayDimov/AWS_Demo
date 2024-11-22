import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Subscription, SubscriptionProtocol, Topic } from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoBD Table creation
        const errorTable = new Table(this, "ErrorTable", {
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: "ttl",
        });

        // Error Topic
        const errorTopic = new Topic(this, "ErrorTopic", {
            topicName: "ErrorTopic",
        });

        // API Gateway
        // function
        const processFunction = new NodejsFunction(this, "processFunction", {
            runtime: Runtime.NODEJS_20_X,
            handler: "handler",
            entry: `${__dirname}/../src/processFunction.ts`,
            // Lambda function must have right to write in tha db table
            environment: {
                TABLE_NAME: errorTable.tableName,
                TOPIC_ARN: errorTopic.topicArn,
            },
        });

        // Lambda function must have right to write and publish in tha db table
        errorTopic.grantPublish(processFunction);
        errorTable.grantReadWriteData(processFunction);

        // api
        const api = new RestApi(this, "ProcessorApi");
        const resource = api.root.addResource("processJSON");
        resource.addMethod("POST", new LambdaIntegration(processFunction));

        new Subscription(this, "ErrorSubscription", {
            topic: errorTopic,
            protocol: SubscriptionProtocol.EMAIL,
            endpoint: "atclient115@gmail.com",
        });

        // REST API output endpoint
        new CfnOutput(this, "RESTApiEndpoint", {
            value: `https://${api.restApiId}.execute-api.eu-center-1.amazonaws.com/prod/processJSON`,
        });
    }
}
