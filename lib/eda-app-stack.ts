import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as iam from "aws-cdk-lib/aws-iam";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";

import { Construct } from "constructs";

export class EDAAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_IMAGE // Enable DynamoDB streams
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
    const processImageFn = new lambdanode.NodejsFunction(
      this,
      "ProcessImageFn",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: `${__dirname}/../lambdas/processImage.ts`,
        timeout: cdk.Duration.seconds(15),
        memorySize: 128,
        environment: {
          TABLE_NAME: imageTable.tableName,
          REGION: 'eu-west-1',
        },
        deadLetterQueue: deadLetterQueue
      }
    );

    const deleteImageFn = new lambdanode.NodejsFunction(
      this,
      "DeleteImageFn",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: `${__dirname}/../lambdas/deleteImage.ts`,
        timeout: cdk.Duration.seconds(15),
        memorySize: 128,
        environment: {
          TABLE_NAME: imageTable.tableName,
          REGION: 'eu-west-1',
        }
      }
    );

    const updateImageDescriptionFn = new lambdanode.NodejsFunction(
      this,
      "UpdateImageDescriptionFn",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: `${__dirname}/../lambdas/updateImageDescription.ts`,
        timeout: cdk.Duration.seconds(15),
        memorySize: 128,
        environment: {
          TABLE_NAME: imageTable.tableName,
          REGION: 'eu-west-1',
        }
      }
    );

    const confirmationMailerFn = new lambdanode.NodejsFunction(this, "ConfirmationMailerFn", {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(3),
      entry: `${__dirname}/../lambdas/confirmationMailer.ts`,
    });

    const rejectionMailerFn = new lambdanode.NodejsFunction(this, "RejectionMailerFn", {
      runtime: lambda.Runtime.NODEJS_14_X,
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
    imagesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(imageEventsTopic)
    );

    imagesBucket.addEventNotification( 
      s3.EventType.OBJECT_REMOVED,
      new s3n.SnsDestination(imageEventsTopic)
    );

    // DynamoDB Stream Handler for Delete Email
    const deleteEmailFn = new lambdanode.NodejsFunction(this, "DeleteEmailFn", {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: `${__dirname}/../lambdas/deleteEmail.ts`,
      environment: {
        TABLE_NAME: imageTable.tableName,
        REGION: 'eu-west-1',
      }
    });

    const dynamoEventSource = new DynamoEventSource(imageTable, {
      startingPosition: StartingPosition.TRIM_HORIZON,
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

    confirmationMailerFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ],
        resources: ["*"],
      })
    );

    rejectionMailerFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ],
        resources: ["*"],
      })
    );

    deleteEmailFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ],
        resources: ["*"],
      })
    );

    // Outputs
    new cdk.CfnOutput(this, "BucketName", {
      value: imagesBucket.bucketName,
    });

    new cdk.CfnOutput(this, "TopicARN", {
      value: imageEventsTopic.topicArn,
    });
  }
}