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

// lambdas/updateImageDescription.ts
var updateImageDescription_exports = {};
__export(updateImageDescription_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(updateImageDescription_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var ddbDocClient = createDDbDocClient();
var handler = async (event) => {
  console.log("Event ", event);
  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.Sns.Message);
    if (snsMessage) {
      const srcKey = snsMessage.name;
      const description = snsMessage.description;
      console.log("Updating image description in DynamoDB");
      await ddbDocClient.send(
        new import_lib_dynamodb.UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { ImageName: srcKey },
          UpdateExpression: "set Description = :desc",
          ExpressionAttributeValues: {
            ":desc": description
          }
        })
      );
    }
  }
};
function createDDbDocClient() {
  const ddbClient = new import_client_dynamodb.DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  };
  const unmarshallOptions = {
    wrapNumbers: false
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return import_lib_dynamodb.DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
