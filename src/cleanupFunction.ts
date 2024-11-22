import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";

// SDK For SNS and DynamoDB
// create 2 clients
const snsClient = new SNSClient({});
const dynamoDBClient = new DynamoDBClient({});

export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    const topicArn = process.env.TOPIC_ARN;

    console.log(event);

    return {
        statusCode: 200,
        body: "Hi from Lambda",
    };
};
