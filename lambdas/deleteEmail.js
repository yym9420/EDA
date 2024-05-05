"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Import AWS SDK modules
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Create DynamoDB Document Client
const ddbDocClient = createDDbDocClient();
// Lambda handler function
const handler = async (event) => {
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
    }
    catch (error) {
        console.error("Error processing DynamoDB stream event:", error);
        throw error;
    }
};
exports.handler = handler;
// Function to create DynamoDB Document Client
function createDDbDocClient() {
    const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: process.env.REGION });
    const marshallOptions = {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    };
    const unmarshallOptions = {
        wrapNumbers: false,
    };
    const translateConfig = { marshallOptions, unmarshallOptions };
    return lib_dynamodb_1.DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlRW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWxldGVFbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSx5QkFBeUI7QUFDekIsOERBQTBEO0FBQzFELHdEQUE4RTtBQUU5RSxrQ0FBa0M7QUFDbEMsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztBQUUxQywwQkFBMEI7QUFDbkIsTUFBTSxPQUFPLEdBQTBCLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM1RCxJQUFJO1FBQ0YsMkRBQTJEO1FBQzNELEtBQUssTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNsQyxzQkFBc0I7WUFDdEIsMEVBQTBFO1lBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTFELHlDQUF5QztZQUN6QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBRXJELHVEQUF1RDtZQUN2RCxlQUFlO1lBQ2YsdUJBQXVCO1NBQ3hCO0tBQ0Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMseUNBQXlDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEUsTUFBTSxLQUFLLENBQUM7S0FDYjtBQUNILENBQUMsQ0FBQztBQW5CVyxRQUFBLE9BQU8sV0FtQmxCO0FBRUYsOENBQThDO0FBQzlDLFNBQVMsa0JBQWtCO0lBQ3pCLE1BQU0sU0FBUyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDckUsTUFBTSxlQUFlLEdBQUc7UUFDdEIsa0JBQWtCLEVBQUUsSUFBSTtRQUN4QixxQkFBcUIsRUFBRSxJQUFJO1FBQzNCLHlCQUF5QixFQUFFLElBQUk7S0FDaEMsQ0FBQztJQUNGLE1BQU0saUJBQWlCLEdBQUc7UUFDeEIsV0FBVyxFQUFFLEtBQUs7S0FDbkIsQ0FBQztJQUNGLE1BQU0sZUFBZSxHQUFHLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLENBQUM7SUFDL0QsT0FBTyxxQ0FBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IER5bmFtb0RCU3RyZWFtSGFuZGxlciB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5cbi8vIEltcG9ydCBBV1MgU0RLIG1vZHVsZXNcbmltcG9ydCB7IER5bmFtb0RCQ2xpZW50IH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHsgRHluYW1vREJEb2N1bWVudENsaWVudCwgRGVsZXRlQ29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9saWItZHluYW1vZGJcIjtcblxuLy8gQ3JlYXRlIER5bmFtb0RCIERvY3VtZW50IENsaWVudFxuY29uc3QgZGRiRG9jQ2xpZW50ID0gY3JlYXRlRERiRG9jQ2xpZW50KCk7XG5cbi8vIExhbWJkYSBoYW5kbGVyIGZ1bmN0aW9uXG5leHBvcnQgY29uc3QgaGFuZGxlcjogRHluYW1vREJTdHJlYW1IYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIHRyeSB7XG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcmVjb3JkIGluIHRoZSBEeW5hbW9EQiBzdHJlYW0gZXZlbnRcbiAgICBmb3IgKGNvbnN0IHJlY29yZCBvZiBldmVudC5SZWNvcmRzKSB7XG4gICAgICAvLyBQcm9jZXNzIGVhY2ggcmVjb3JkXG4gICAgICAvLyBIZXJlIHlvdSBjYW4gd3JpdGUgdGhlIGxvZ2ljIHRvIHNlbmQgZW1haWwgb3IgcGVyZm9ybSBhbnkgb3RoZXIgYWN0aW9uc1xuICAgICAgY29uc29sZS5sb2coXCJQcm9jZXNzaW5nIHJlY29yZDpcIiwgSlNPTi5zdHJpbmdpZnkocmVjb3JkKSk7XG5cbiAgICAgIC8vIEV4dHJhY3QgbmVjZXNzYXJ5IGRhdGEgZnJvbSB0aGUgcmVjb3JkXG4gICAgICBjb25zdCBpbWFnZUtleSA9IHJlY29yZC5keW5hbW9kYj8uS2V5cz8uSW1hZ2VOYW1lPy5TO1xuXG4gICAgICAvLyBQZXJmb3JtIGFueSBuZWNlc3NhcnkgYWN0aW9ucywgc3VjaCBhcyBzZW5kaW5nIGVtYWlsXG4gICAgICAvLyBGb3IgZXhhbXBsZTpcbiAgICAgIC8vIHNlbmRFbWFpbChpbWFnZUtleSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIER5bmFtb0RCIHN0cmVhbSBldmVudDpcIiwgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjcmVhdGUgRHluYW1vREIgRG9jdW1lbnQgQ2xpZW50XG5mdW5jdGlvbiBjcmVhdGVERGJEb2NDbGllbnQoKSB7XG4gIGNvbnN0IGRkYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7IHJlZ2lvbjogcHJvY2Vzcy5lbnYuUkVHSU9OIH0pO1xuICBjb25zdCBtYXJzaGFsbE9wdGlvbnMgPSB7XG4gICAgY29udmVydEVtcHR5VmFsdWVzOiB0cnVlLFxuICAgIHJlbW92ZVVuZGVmaW5lZFZhbHVlczogdHJ1ZSxcbiAgICBjb252ZXJ0Q2xhc3NJbnN0YW5jZVRvTWFwOiB0cnVlLFxuICB9O1xuICBjb25zdCB1bm1hcnNoYWxsT3B0aW9ucyA9IHtcbiAgICB3cmFwTnVtYmVyczogZmFsc2UsXG4gIH07XG4gIGNvbnN0IHRyYW5zbGF0ZUNvbmZpZyA9IHsgbWFyc2hhbGxPcHRpb25zLCB1bm1hcnNoYWxsT3B0aW9ucyB9O1xuICByZXR1cm4gRHluYW1vREJEb2N1bWVudENsaWVudC5mcm9tKGRkYkNsaWVudCwgdHJhbnNsYXRlQ29uZmlnKTtcbn0iXX0=