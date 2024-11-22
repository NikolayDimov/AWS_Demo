"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/processFunction.ts
var processFunction_exports = {};
__export(processFunction_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(processFunction_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_client_sns = require("@aws-sdk/client-sns");
var snsClient = new import_client_sns.SNSClient({});
var dynamoDBClient = new import_client_dynamodb.DynamoDBClient({});
var handler = async (event) => {
  const tableName = process.env.TABLE_NAME;
  const topicArn = process.env.TOPIC_ARN;
  console.log(event);
  if (!event || !event.text) {
    const ttl = Math.floor(Date.now() / 1e3) + 30 * 60;
    await dynamoDBClient.send(
      new import_client_dynamodb.PutItemCommand({
        TableName: tableName,
        Item: {
          id: {
            S: Math.random().toString()
          },
          errorMessage: {
            S: "Something it wrong!"
          },
          ttl: {
            N: ttl.toString()
          }
        }
      })
    );
  } else {
    await snsClient.send(
      new import_client_sns.PublishCommand({
        TopicArn: topicArn,
        Message: `Valid JSON received: ${event.text}`
      })
    );
  }
  return {
    statusCode: 200,
    body: "Hi from Lambda"
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
