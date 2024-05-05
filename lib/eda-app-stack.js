"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDAAppStack = void 0;
const cdk = require("aws-cdk-lib");
const sqs = require("aws-cdk-lib/aws-sqs");
const lambdanode = require("aws-cdk-lib/aws-lambda-nodejs");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const s3n = require("aws-cdk-lib/aws-s3-notifications");
const sns = require("aws-cdk-lib/aws-sns");
const subs = require("aws-cdk-lib/aws-sns-subscriptions");
const iam = require("aws-cdk-lib/aws-iam");
const aws_lambda_event_sources_1 = require("aws-cdk-lib/aws-lambda-event-sources");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
class EDAAppStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 bucket for image uploads
        const imagesBucket = new s3.Bucket(this, "images", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            publicReadAccess: false,
        });
        // DynamoDB table for storing image metadata
        const imageTable = new dynamodb.Table(this, "ImageTable", {
            tableName: "Images",
            partitionKey: {
                name: "ImageName",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        // SQS queues for image processing
        const deadLetterQueue = new sqs.Queue(this, "dead-letter-queue", {
            retentionPeriod: cdk.Duration.minutes(30),
        });
        const imageProcessQueue = new sqs.Queue(this, "img-created-queue", {
            receiveMessageWaitTime: cdk.Duration.seconds(10),
            deadLetterQueue: {
                queue: deadLetterQueue,
                maxReceiveCount: 2
            }
        });
        // SNS topic for image events
        const imageEventsTopic = new sns.Topic(this, "ImageEventsTopic", {
            displayName: "Image Events Topic",
        });
        // Lambda functions
        const processImageFn = new lambdanode.NodejsFunction(this, "ProcessImageFn", {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: `${__dirname}/../lambdas/processImage.ts`,
            timeout: cdk.Duration.seconds(15),
            memorySize: 128,
            environment: {
                TABLE_NAME: imageTable.tableName,
                REGION: 'eu-west-1',
            },
            deadLetterQueue: deadLetterQueue
        });
        const deleteImageFn = new lambdanode.NodejsFunction(this, "DeleteImageFn", {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: `${__dirname}/../lambdas/deleteImage.ts`,
            timeout: cdk.Duration.seconds(15),
            memorySize: 128,
            environment: {
                TABLE_NAME: imageTable.tableName,
                REGION: 'eu-west-1',
            }
        });
        const updateImageDescriptionFn = new lambdanode.NodejsFunction(this, "UpdateImageDescriptionFn", {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: `${__dirname}/../lambdas/updateImageDescription.ts`,
            timeout: cdk.Duration.seconds(15),
            memorySize: 128,
            environment: {
                TABLE_NAME: imageTable.tableName,
                REGION: 'eu-west-1',
            }
        });
        const confirmationMailerFn = new lambdanode.NodejsFunction(this, "ConfirmationMailerFn", {
            runtime: lambda.Runtime.NODEJS_16_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(3),
            entry: `${__dirname}/../lambdas/confirmationMailer.ts`,
        });
        const rejectionMailerFn = new lambdanode.NodejsFunction(this, "RejectionMailerFn", {
            runtime: lambda.Runtime.NODEJS_16_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(3),
            entry: `${__dirname}/../lambdas/rejectionMailer.ts`,
        });
        // Topic Subscriptions
        const confirmationMailerSub = new subs.LambdaSubscription(confirmationMailerFn);
        const rejectionMailerSub = new subs.LambdaSubscription(rejectionMailerFn);
        imageEventsTopic.addSubscription(confirmationMailerSub);
        imageEventsTopic.addSubscription(rejectionMailerSub);
        // S3 Event Notifications
        imagesBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SnsDestination(imageEventsTopic));
        imagesBucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new s3n.SnsDestination(imageEventsTopic));
        // DynamoDB Stream Handler for Delete Email
        const deleteEmailFn = new lambdanode.NodejsFunction(this, "DeleteEmailFn", {
            runtime: lambda.Runtime.NODEJS_14_X,
            entry: `${__dirname}/../lambdas/deleteEmail.ts`,
            environment: {
                TABLE_NAME: imageTable.tableName,
                REGION: 'eu-west-1',
            }
        });
        const dynamoEventSource = new aws_lambda_event_sources_1.DynamoEventSource(imageTable, {
            startingPosition: aws_lambda_1.StartingPosition.TRIM_HORIZON,
            batchSize: 5,
        });
        deleteEmailFn.addEventSource(dynamoEventSource);
        // Permissions
        imagesBucket.grantReadWrite(processImageFn);
        imageTable.grantReadWriteData(processImageFn);
        imagesBucket.grantReadWrite(deleteImageFn);
        imageTable.grantReadWriteData(deleteImageFn);
        imagesBucket.grantReadWrite(updateImageDescriptionFn);
        imageTable.grantReadWriteData(updateImageDescriptionFn);
        imagesBucket.grantReadWrite(deleteEmailFn);
        imageTable.grantReadWriteData(deleteEmailFn);
        confirmationMailerFn.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:SendTemplatedEmail",
            ],
            resources: ["*"],
        }));
        rejectionMailerFn.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:SendTemplatedEmail",
            ],
            resources: ["*"],
        }));
        deleteEmailFn.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:SendTemplatedEmail",
            ],
            resources: ["*"],
        }));
        // Outputs
        new cdk.CfnOutput(this, "BucketName", {
            value: imagesBucket.bucketName,
        });
        new cdk.CfnOutput(this, "TopicARN", {
            value: imageEventsTopic.topicArn,
        });
    }
}
exports.EDAAppStack = EDAAppStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRhLWFwcC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVkYS1hcHAtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyw0REFBNEQ7QUFDNUQsaURBQWlEO0FBQ2pELHlDQUF5QztBQUN6QyxxREFBcUQ7QUFDckQsd0RBQXdEO0FBQ3hELDJDQUEyQztBQUMzQywwREFBMEQ7QUFDMUQsMkNBQTJDO0FBQzNDLG1GQUF5RTtBQUN6RSx1REFBMEQ7QUFJMUQsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4QkFBOEI7UUFDOUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDakQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGdCQUFnQixFQUFFLEtBQUs7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3hELFNBQVMsRUFBRSxRQUFRO1lBQ25CLFlBQVksRUFBRTtnQkFDWixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTTthQUNwQztZQUNELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87U0FDekMsQ0FBQyxDQUFDO1FBRUgsa0NBQWtDO1FBQ2xDLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDL0Qs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Q3pCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FDSCxDQUFDO1FBRUYsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxZQUFZLENBQUMsVUFBVTtTQUMvQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNsQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtTQUNqQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE3TEQsa0NBNkxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgc3FzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc3FzXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGFub2RlIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqc1wiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQgKiBhcyBzM24gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zMy1ub3RpZmljYXRpb25zXCI7XG5pbXBvcnQgKiBhcyBzbnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zbnNcIjtcbmltcG9ydCAqIGFzIHN1YnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zbnMtc3Vic2NyaXB0aW9uc1wiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBEeW5hbW9FdmVudFNvdXJjZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXNcIjtcbmltcG9ydCB7IFN0YXJ0aW5nUG9zaXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xuXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuXG5leHBvcnQgY2xhc3MgRURBQXBwU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBTMyBidWNrZXQgZm9yIGltYWdlIHVwbG9hZHNcbiAgICBjb25zdCBpbWFnZXNCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIFwiaW1hZ2VzXCIsIHtcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlLFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgdGFibGUgZm9yIHN0b3JpbmcgaW1hZ2UgbWV0YWRhdGFcbiAgICBjb25zdCBpbWFnZVRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsIFwiSW1hZ2VUYWJsZVwiLCB7XG4gICAgICB0YWJsZU5hbWU6IFwiSW1hZ2VzXCIsXG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogXCJJbWFnZU5hbWVcIiwgXG4gICAgICAgIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HLCBcbiAgICAgIH0sXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZXG4gICAgfSk7XG5cbiAgICAvLyBTUVMgcXVldWVzIGZvciBpbWFnZSBwcm9jZXNzaW5nXG4gICAgY29uc3QgZGVhZExldHRlclF1ZXVlID0gbmV3IHNxcy5RdWV1ZSh0aGlzLCBcImRlYWQtbGV0dGVyLXF1ZXVlXCIsIHsgXG4gICAgICByZXRlbnRpb25QZXJpb2Q6IGNkay5EdXJhdGlvbi5taW51dGVzKDMwKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGltYWdlUHJvY2Vzc1F1ZXVlID0gbmV3IHNxcy5RdWV1ZSh0aGlzLCBcImltZy1jcmVhdGVkLXF1ZXVlXCIsIHtcbiAgICAgIHJlY2VpdmVNZXNzYWdlV2FpdFRpbWU6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcbiAgICAgIGRlYWRMZXR0ZXJRdWV1ZToge1xuICAgICAgICBxdWV1ZTogZGVhZExldHRlclF1ZXVlLFxuICAgICAgICBtYXhSZWNlaXZlQ291bnQ6IDJcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFNOUyB0b3BpYyBmb3IgaW1hZ2UgZXZlbnRzXG4gICAgY29uc3QgaW1hZ2VFdmVudHNUb3BpYyA9IG5ldyBzbnMuVG9waWModGhpcywgXCJJbWFnZUV2ZW50c1RvcGljXCIsIHtcbiAgICAgIGRpc3BsYXlOYW1lOiBcIkltYWdlIEV2ZW50cyBUb3BpY1wiLFxuICAgIH0pOyBcblxuICAgIC8vIExhbWJkYSBmdW5jdGlvbnNcbiAgICBjb25zdCBwcm9jZXNzSW1hZ2VGbiA9IG5ldyBsYW1iZGFub2RlLk5vZGVqc0Z1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIFwiUHJvY2Vzc0ltYWdlRm5cIixcbiAgICAgIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgIGVudHJ5OiBgJHtfX2Rpcm5hbWV9Ly4uL2xhbWJkYXMvcHJvY2Vzc0ltYWdlLnRzYCxcbiAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTUpLFxuICAgICAgICBtZW1vcnlTaXplOiAxMjgsXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgVEFCTEVfTkFNRTogaW1hZ2VUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgICAgUkVHSU9OOiAnZXUtd2VzdC0xJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGVhZExldHRlclF1ZXVlOiBkZWFkTGV0dGVyUXVldWVcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgZGVsZXRlSW1hZ2VGbiA9IG5ldyBsYW1iZGFub2RlLk5vZGVqc0Z1bmN0aW9uKFxuICAgICAgdGhpcyxcbiAgICAgIFwiRGVsZXRlSW1hZ2VGblwiLFxuICAgICAge1xuICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgZW50cnk6IGAke19fZGlybmFtZX0vLi4vbGFtYmRhcy9kZWxldGVJbWFnZS50c2AsXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDE1KSxcbiAgICAgICAgbWVtb3J5U2l6ZTogMTI4LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFRBQkxFX05BTUU6IGltYWdlVGFibGUudGFibGVOYW1lLFxuICAgICAgICAgIFJFR0lPTjogJ2V1LXdlc3QtMScsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgdXBkYXRlSW1hZ2VEZXNjcmlwdGlvbkZuID0gbmV3IGxhbWJkYW5vZGUuTm9kZWpzRnVuY3Rpb24oXG4gICAgICB0aGlzLFxuICAgICAgXCJVcGRhdGVJbWFnZURlc2NyaXB0aW9uRm5cIixcbiAgICAgIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgIGVudHJ5OiBgJHtfX2Rpcm5hbWV9Ly4uL2xhbWJkYXMvdXBkYXRlSW1hZ2VEZXNjcmlwdGlvbi50c2AsXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDE1KSxcbiAgICAgICAgbWVtb3J5U2l6ZTogMTI4LFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFRBQkxFX05BTUU6IGltYWdlVGFibGUudGFibGVOYW1lLFxuICAgICAgICAgIFJFR0lPTjogJ2V1LXdlc3QtMScsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgY29uZmlybWF0aW9uTWFpbGVyRm4gPSBuZXcgbGFtYmRhbm9kZS5Ob2RlanNGdW5jdGlvbih0aGlzLCBcIkNvbmZpcm1hdGlvbk1haWxlckZuXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMpLFxuICAgICAgZW50cnk6IGAke19fZGlybmFtZX0vLi4vbGFtYmRhcy9jb25maXJtYXRpb25NYWlsZXIudHNgLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVqZWN0aW9uTWFpbGVyRm4gPSBuZXcgbGFtYmRhbm9kZS5Ob2RlanNGdW5jdGlvbih0aGlzLCBcIlJlamVjdGlvbk1haWxlckZuXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMpLFxuICAgICAgZW50cnk6IGAke19fZGlybmFtZX0vLi4vbGFtYmRhcy9yZWplY3Rpb25NYWlsZXIudHNgLFxuICAgIH0pO1xuXG4gICAgLy8gVG9waWMgU3Vic2NyaXB0aW9uc1xuICAgIGNvbnN0IGNvbmZpcm1hdGlvbk1haWxlclN1YiA9IG5ldyBzdWJzLkxhbWJkYVN1YnNjcmlwdGlvbihjb25maXJtYXRpb25NYWlsZXJGbik7XG4gICAgY29uc3QgcmVqZWN0aW9uTWFpbGVyU3ViID0gbmV3IHN1YnMuTGFtYmRhU3Vic2NyaXB0aW9uKHJlamVjdGlvbk1haWxlckZuKTtcbiAgICBpbWFnZUV2ZW50c1RvcGljLmFkZFN1YnNjcmlwdGlvbihjb25maXJtYXRpb25NYWlsZXJTdWIpO1xuICAgIGltYWdlRXZlbnRzVG9waWMuYWRkU3Vic2NyaXB0aW9uKHJlamVjdGlvbk1haWxlclN1Yik7XG5cbiAgICAvLyBTMyBFdmVudCBOb3RpZmljYXRpb25zXG4gICAgaW1hZ2VzQnVja2V0LmFkZEV2ZW50Tm90aWZpY2F0aW9uKFxuICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxuICAgICAgbmV3IHMzbi5TbnNEZXN0aW5hdGlvbihpbWFnZUV2ZW50c1RvcGljKVxuICAgICk7XG5cbiAgICBpbWFnZXNCdWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oIFxuICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9SRU1PVkVELFxuICAgICAgbmV3IHMzbi5TbnNEZXN0aW5hdGlvbihpbWFnZUV2ZW50c1RvcGljKVxuICAgICk7XG5cbiAgICAvLyBEeW5hbW9EQiBTdHJlYW0gSGFuZGxlciBmb3IgRGVsZXRlIEVtYWlsXG4gICAgY29uc3QgZGVsZXRlRW1haWxGbiA9IG5ldyBsYW1iZGFub2RlLk5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiRGVsZXRlRW1haWxGblwiLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTRfWCxcbiAgICAgIGVudHJ5OiBgJHtfX2Rpcm5hbWV9Ly4uL2xhbWJkYXMvZGVsZXRlRW1haWwudHNgLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgVEFCTEVfTkFNRTogaW1hZ2VUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIFJFR0lPTjogJ2V1LXdlc3QtMScsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBkeW5hbW9FdmVudFNvdXJjZSA9IG5ldyBEeW5hbW9FdmVudFNvdXJjZShpbWFnZVRhYmxlLCB7XG4gICAgICBzdGFydGluZ1Bvc2l0aW9uOiBTdGFydGluZ1Bvc2l0aW9uLlRSSU1fSE9SSVpPTixcbiAgICAgIGJhdGNoU2l6ZTogNSxcbiAgICB9KTtcblxuICAgIGRlbGV0ZUVtYWlsRm4uYWRkRXZlbnRTb3VyY2UoZHluYW1vRXZlbnRTb3VyY2UpO1xuXG4gICAgLy8gUGVybWlzc2lvbnNcbiAgICBpbWFnZXNCdWNrZXQuZ3JhbnRSZWFkV3JpdGUocHJvY2Vzc0ltYWdlRm4pO1xuICAgIGltYWdlVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHByb2Nlc3NJbWFnZUZuKTtcbiAgICBpbWFnZXNCdWNrZXQuZ3JhbnRSZWFkV3JpdGUoZGVsZXRlSW1hZ2VGbik7XG4gICAgaW1hZ2VUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZGVsZXRlSW1hZ2VGbik7XG4gICAgaW1hZ2VzQnVja2V0LmdyYW50UmVhZFdyaXRlKHVwZGF0ZUltYWdlRGVzY3JpcHRpb25Gbik7XG4gICAgaW1hZ2VUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEodXBkYXRlSW1hZ2VEZXNjcmlwdGlvbkZuKTtcbiAgICBpbWFnZXNCdWNrZXQuZ3JhbnRSZWFkV3JpdGUoZGVsZXRlRW1haWxGbik7XG4gICAgaW1hZ2VUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZGVsZXRlRW1haWxGbik7XG5cbiAgICBjb25maXJtYXRpb25NYWlsZXJGbi5hZGRUb1JvbGVQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgIFwic2VzOlNlbmRFbWFpbFwiLFxuICAgICAgICAgIFwic2VzOlNlbmRSYXdFbWFpbFwiLFxuICAgICAgICAgIFwic2VzOlNlbmRUZW1wbGF0ZWRFbWFpbFwiLFxuICAgICAgICBdLFxuICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZWplY3Rpb25NYWlsZXJGbi5hZGRUb1JvbGVQb2xpY3koXG4gICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgIFwic2VzOlNlbmRFbWFpbFwiLFxuICAgICAgICAgIFwic2VzOlNlbmRSYXdFbWFpbFwiLFxuICAgICAgICAgIFwic2VzOlNlbmRUZW1wbGF0ZWRFbWFpbFwiLFxuICAgICAgICBdLFxuICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBkZWxldGVFbWFpbEZuLmFkZFRvUm9sZVBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgXCJzZXM6U2VuZEVtYWlsXCIsXG4gICAgICAgICAgXCJzZXM6U2VuZFJhd0VtYWlsXCIsXG4gICAgICAgICAgXCJzZXM6U2VuZFRlbXBsYXRlZEVtYWlsXCIsXG4gICAgICAgIF0sXG4gICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkJ1Y2tldE5hbWVcIiwge1xuICAgICAgdmFsdWU6IGltYWdlc0J1Y2tldC5idWNrZXROYW1lLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJUb3BpY0FSTlwiLCB7XG4gICAgICB2YWx1ZTogaW1hZ2VFdmVudHNUb3BpYy50b3BpY0FybixcbiAgICB9KTtcbiAgfVxufSJdfQ==