import type { DynamoDBStreamHandler } from "aws-lambda";

// Import AWS SDK modules
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB Document Client
const ddbDocClient = createDDbDocClient();

// Lambda handler function
export const handler: DynamoDBStreamHandler = async (event) => {
  try {
    // Iterate through each record in the DynamoDB stream event
    for (const record of event.Records) {
      // Process each record
      // Here you can write the logic to send email or perform any other actions
      console.log("Processing record:", JSON.stringify(record));

      // Extract necessary data from the record
      const imageKey = record.dynamodb?.Keys?.ImageName?.S;

      // Perform any necessary actions, such as sending email
      // For example:
      // sendEmail(imageKey);
    }
  } catch (error) {
    console.error("Error processing DynamoDB stream event:", error);
    throw error;
  }
};

// Function to create DynamoDB Document Client
function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}