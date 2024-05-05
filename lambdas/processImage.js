"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const ddbDocClient = createDDbDocClient(); //DynamoDB client
const handler = async (event) => {
    console.log("Event ", event);
    for (const record of event.Records) {
        const recordBody = JSON.parse(record.body);
        console.log('Raw SNS message ', JSON.stringify(recordBody));
        const recordMessage = JSON.parse(recordBody.Message);
        console.log('SNS Message: ', recordMessage);
        if (recordMessage.Records) {
            for (const messageRecord of recordMessage.Records) {
                const s3e = messageRecord.s3;
                // Object key may have spaces or unicode non-ASCII characters.
                const srcKey = decodeURIComponent(s3e.object.key.replace(/\+/g, " "));
                // Infer the image type from the file suffix.
                const typeMatch = srcKey.match(/\.([^.]*)$/);
                if (!typeMatch) {
                    console.log("Could not determine the image type.");
                    throw new Error("Could not determine the image type. ");
                }
                // Check that the image type is supported
                const imageType = typeMatch[1].toLowerCase();
                if (imageType != "jpeg" && imageType != "png") {
                    console.log(`Unsupported image type: ${imageType}`);
                    throw new Error("Unsupported image type: ${imageType. ");
                }
                console.log("Inserting image to into DynamoDB");
                await ddbDocClient.send(new lib_dynamodb_1.PutCommand({
                    TableName: process.env.TABLE_NAME,
                    Item: {
                        "ImageName": srcKey
                    }
                }));
            }
        }
        else {
            console.log("Error");
        }
    }
};
exports.handler = handler;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc0ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvY2Vzc0ltYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDhEQUEwRDtBQUMxRCx3REFBMkU7QUFFM0UsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQjtBQUVyRCxNQUFNLE9BQU8sR0FBZSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0IsS0FBSyxNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1FBQzFELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBRTNDLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtZQUN6QixLQUFLLE1BQU0sYUFBYSxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7Z0JBRWpELE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUM7Z0JBRTdCLDhEQUE4RDtnQkFDOUQsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUV0RSw2Q0FBNkM7Z0JBQzdDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO29CQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7aUJBQ3pEO2dCQUVELHlDQUF5QztnQkFDekMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3QyxJQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLEtBQUssRUFBRTtvQkFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsU0FBUyxFQUFFLENBQUMsQ0FBQztvQkFDcEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7Z0JBQy9DLE1BQU0sWUFBWSxDQUFDLElBQUksQ0FDckIsSUFBSSx5QkFBVSxDQUFDO29CQUNiLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7b0JBQ2pDLElBQUksRUFBRTt3QkFDSixXQUFXLEVBQUUsTUFBTTtxQkFDcEI7aUJBQ0YsQ0FBQyxDQUNILENBQUE7YUFDRjtTQUNGO2FBQUs7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQ3JCO0tBQ0Y7QUFDSCxDQUFDLENBQUM7QUE1Q1csUUFBQSxPQUFPLFdBNENsQjtBQUVGLFNBQVMsa0JBQWtCO0lBQ3pCLE1BQU0sU0FBUyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDckUsTUFBTSxlQUFlLEdBQUc7UUFDdEIsa0JBQWtCLEVBQUUsSUFBSTtRQUN4QixxQkFBcUIsRUFBRSxJQUFJO1FBQzNCLHlCQUF5QixFQUFFLElBQUk7S0FDaEMsQ0FBQztJQUNGLE1BQU0saUJBQWlCLEdBQUc7UUFDeEIsV0FBVyxFQUFFLEtBQUs7S0FDbkIsQ0FBQztJQUNGLE1BQU0sZUFBZSxHQUFHLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLENBQUM7SUFDL0QsT0FBTyxxQ0FBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTUVNIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7IER5bmFtb0RCQ2xpZW50IH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHsgRHluYW1vREJEb2N1bWVudENsaWVudCwgUHV0Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9saWItZHluYW1vZGJcIjtcblxuY29uc3QgZGRiRG9jQ2xpZW50ID0gY3JlYXRlRERiRG9jQ2xpZW50KCk7IC8vRHluYW1vREIgY2xpZW50XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBTUVNIYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIGNvbnNvbGUubG9nKFwiRXZlbnQgXCIsIGV2ZW50KTtcbiAgZm9yIChjb25zdCByZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgIGNvbnN0IHJlY29yZEJvZHkgPSBKU09OLnBhcnNlKHJlY29yZC5ib2R5KTtcbiAgICBjb25zb2xlLmxvZygnUmF3IFNOUyBtZXNzYWdlICcsSlNPTi5zdHJpbmdpZnkocmVjb3JkQm9keSkpXG4gICAgY29uc3QgcmVjb3JkTWVzc2FnZSA9IEpTT04ucGFyc2UocmVjb3JkQm9keS5NZXNzYWdlKTtcbiAgICBjb25zb2xlLmxvZygnU05TIE1lc3NhZ2U6ICcsIHJlY29yZE1lc3NhZ2UpXG5cbiAgICBpZiAocmVjb3JkTWVzc2FnZS5SZWNvcmRzKSB7XG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2VSZWNvcmQgb2YgcmVjb3JkTWVzc2FnZS5SZWNvcmRzKSB7XG5cbiAgICAgICAgY29uc3QgczNlID0gbWVzc2FnZVJlY29yZC5zMztcblxuICAgICAgICAvLyBPYmplY3Qga2V5IG1heSBoYXZlIHNwYWNlcyBvciB1bmljb2RlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLlxuICAgICAgICBjb25zdCBzcmNLZXkgPSBkZWNvZGVVUklDb21wb25lbnQoczNlLm9iamVjdC5rZXkucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XG5cbiAgICAgICAgLy8gSW5mZXIgdGhlIGltYWdlIHR5cGUgZnJvbSB0aGUgZmlsZSBzdWZmaXguXG4gICAgICAgIGNvbnN0IHR5cGVNYXRjaCA9IHNyY0tleS5tYXRjaCgvXFwuKFteLl0qKSQvKTtcbiAgICAgICAgaWYgKCF0eXBlTWF0Y2gpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBkZXRlcm1pbmUgdGhlIGltYWdlIHR5cGUuXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBkZXRlcm1pbmUgdGhlIGltYWdlIHR5cGUuIFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIHRoYXQgdGhlIGltYWdlIHR5cGUgaXMgc3VwcG9ydGVkXG4gICAgICAgIGNvbnN0IGltYWdlVHlwZSA9IHR5cGVNYXRjaFsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoaW1hZ2VUeXBlICE9IFwianBlZ1wiICYmIGltYWdlVHlwZSAhPSBcInBuZ1wiKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYFVuc3VwcG9ydGVkIGltYWdlIHR5cGU6ICR7aW1hZ2VUeXBlfWApO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIGltYWdlIHR5cGU6ICR7aW1hZ2VUeXBlLiBcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhcIkluc2VydGluZyBpbWFnZSB0byBpbnRvIER5bmFtb0RCXCIpXG4gICAgICAgIGF3YWl0IGRkYkRvY0NsaWVudC5zZW5kKFxuICAgICAgICAgIG5ldyBQdXRDb21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuVEFCTEVfTkFNRSxcbiAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgXCJJbWFnZU5hbWVcIjogc3JjS2V5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0gZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3JcIilcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUREYkRvY0NsaWVudCgpIHtcbiAgY29uc3QgZGRiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHsgcmVnaW9uOiBwcm9jZXNzLmVudi5SRUdJT04gfSk7XG4gIGNvbnN0IG1hcnNoYWxsT3B0aW9ucyA9IHtcbiAgICBjb252ZXJ0RW1wdHlWYWx1ZXM6IHRydWUsXG4gICAgcmVtb3ZlVW5kZWZpbmVkVmFsdWVzOiB0cnVlLFxuICAgIGNvbnZlcnRDbGFzc0luc3RhbmNlVG9NYXA6IHRydWUsXG4gIH07XG4gIGNvbnN0IHVubWFyc2hhbGxPcHRpb25zID0ge1xuICAgIHdyYXBOdW1iZXJzOiBmYWxzZSxcbiAgfTtcbiAgY29uc3QgdHJhbnNsYXRlQ29uZmlnID0geyBtYXJzaGFsbE9wdGlvbnMsIHVubWFyc2hhbGxPcHRpb25zIH07XG4gIHJldHVybiBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LmZyb20oZGRiQ2xpZW50LCB0cmFuc2xhdGVDb25maWcpO1xufSJdfQ==