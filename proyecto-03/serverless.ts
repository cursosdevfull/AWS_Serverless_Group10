import appointment from "@functions/appointment/infrastructure/presentation";
import appointment_co from "@functions/appointment_co/infrastructure/presentation";
import appointment_mx from "@functions/appointment_mx/infrastructure/presentation";
import appointment_pe from "@functions/appointment_pe/infrastructure/presentation";
import sentEmail from "@functions/sent-email";

import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "appointment",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-s3-sync"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: "us-east-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    stage: "${opt:stage, 'dev'}",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      REGION: "${self:provider.region}",
      APPOINTMENT_CO: "${self:service}-${self:provider.stage}-appointment_co",
      APPOINTMENT_MX: "${self:service}-${self:provider.stage}-appointment_mx",
      APPOINTMENT_PE: "${self:service}-${self:provider.stage}-appointment_pe",
      APPOINTMENT_TABLE:
        "${self:service}-${self:provider.stage}-AppointmentTable",
      APPOINTMENT_TABLE_PE:
        "${self:service}-${self:provider.stage}-AppointmentTable-pe",
      APPOINTMENT_TABLE_CO:
        "${self:service}-${self:provider.stage}-AppointmentTable-co",
      APPOINTMENT_TABLE_MX:
        "${self:service}-${self:provider.stage}-AppointmentTable-mx",
      APPOINTMENT_CO_URL: { Ref: "AppointmentQueueCO" },
      APPOINTMENT_MX_URL: { Ref: "AppointmentQueueMX" },
      APPOINTMENT_PE_URL: { Ref: "AppointmentQueuePE" },
      SNS_TOPIC_ARN: { Ref: "AppointmentSNSTopic" },
      UPDATE_STATUS_SNS_TOPIC_ARN: { Ref: "UpdateStatusSNSTopic" },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "s3:*",
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: "ses:SendEmail",
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: ["lambda:InvokeFunction"],
            Resource: "arn:aws:lambda:*:*:*",
          },
          {
            Effect: "Allow",
            Action: ["dynamodb:PutItem", "dynamodb:UpdateItem"],
            Resource: "arn:aws:dynamodb:*:*:*",
          },
          {
            Effect: "Allow",
            Action: ["sns:Publish"],
            Resource: "arn:aws:sns:*:*:*",
          },
          {
            Effect: "Allow",
            Action: [
              "sqs:SendMessage",
              "sqs:ReceiveMessage",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ],
            Resource: [
              {
                "Fn::GetAtt": ["AppointmentQueueCO", "Arn"],
              },
              {
                "Fn::GetAtt": ["AppointmentQueueMX", "Arn"],
              },
              {
                "Fn::GetAtt": ["AppointmentQueuePE", "Arn"],
              },
              {
                "Fn::GetAtt": ["UpdateStatusQueue", "Arn"],
              },
              {
                "Fn::GetAtt": ["SentEmailQueue", "Arn"],
              },
            ],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    appointment,
    appointment_pe,
    appointment_co,
    appointment_mx,
    sentEmail,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    s3Sync: [
      {
        bucketName:
          "${self:service}-${self:provider.stage}-template-html-bucket",
        bucketPrefix: "templates/",
        localDir: "html",
      },
    ],
  },
  resources: {
    Resources: {
      AppointmentTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:service}-${self:provider.stage}-AppointmentTable",
          AttributeDefinitions: [
            {
              AttributeName: "appointmentId",
              AttributeType: "S",
            },
            {
              AttributeName: "patientId",
              AttributeType: "N",
            },
            {
              AttributeName: "countryISO",
              AttributeType: "S",
            },
            {
              AttributeName: "createdAt",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "appointmentId",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
          GlobalSecondaryIndexes: [
            {
              IndexName: "patientIdIndex",
              KeySchema: [
                {
                  AttributeName: "patientId",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "countryISO",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
            {
              IndexName: "countryISOIndex",
              KeySchema: [
                {
                  AttributeName: "countryISO",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "createdAt",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
        },
      },
      AppointmentTablePE: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName:
            "${self:service}-${self:provider.stage}-AppointmentTable-pe",
          AttributeDefinitions: [
            {
              AttributeName: "appointmentId",
              AttributeType: "S",
            },
            {
              AttributeName: "patientId",
              AttributeType: "N",
            },
            {
              AttributeName: "countryISO",
              AttributeType: "S",
            },
            {
              AttributeName: "createdAt",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "appointmentId",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
          GlobalSecondaryIndexes: [
            {
              IndexName: "patientIdIndex",
              KeySchema: [
                {
                  AttributeName: "patientId",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "countryISO",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
            {
              IndexName: "countryISOIndex",
              KeySchema: [
                {
                  AttributeName: "countryISO",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "createdAt",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
        },
      },
      AppointmentTableCO: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName:
            "${self:service}-${self:provider.stage}-AppointmentTable-co",
          AttributeDefinitions: [
            {
              AttributeName: "appointmentId",
              AttributeType: "S",
            },
            {
              AttributeName: "patientId",
              AttributeType: "N",
            },
            {
              AttributeName: "countryISO",
              AttributeType: "S",
            },
            {
              AttributeName: "createdAt",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "appointmentId",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
          GlobalSecondaryIndexes: [
            {
              IndexName: "patientIdIndex",
              KeySchema: [
                {
                  AttributeName: "patientId",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "countryISO",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
            {
              IndexName: "countryISOIndex",
              KeySchema: [
                {
                  AttributeName: "countryISO",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "createdAt",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
        },
      },
      AppointmentTableMX: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName:
            "${self:service}-${self:provider.stage}-AppointmentTable-mx",
          AttributeDefinitions: [
            {
              AttributeName: "appointmentId",
              AttributeType: "S",
            },
            {
              AttributeName: "patientId",
              AttributeType: "N",
            },
            {
              AttributeName: "countryISO",
              AttributeType: "S",
            },
            {
              AttributeName: "createdAt",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "appointmentId",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
          GlobalSecondaryIndexes: [
            {
              IndexName: "patientIdIndex",
              KeySchema: [
                {
                  AttributeName: "patientId",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "countryISO",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
            {
              IndexName: "countryISOIndex",
              KeySchema: [
                {
                  AttributeName: "countryISO",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "createdAt",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
        },
      },
      AppointmentQueueCO: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName:
            "${self:service}-${self:provider.stage}-AppointmentQueue-co.fifo",
          FifoQueue: true,
          ContentBasedDeduplication: true,
        },
      },
      AppointmentQueueMX: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName:
            "${self:service}-${self:provider.stage}-AppointmentQueue-mx.fifo",
          FifoQueue: true,
          ContentBasedDeduplication: true,
        },
      },
      AppointmentQueuePE: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName:
            "${self:service}-${self:provider.stage}-AppointmentQueue-pe.fifo",
          FifoQueue: true,
          ContentBasedDeduplication: true,
        },
      },
      AppointmentSNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName:
            "${self:service}-${self:provider.stage}-AppointmentSNSTopic.fifo",
          FifoTopic: true,
          ContentBasedDeduplication: true,
        },
      },
      AppointmentQueueCOSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          TopicArn: { Ref: "AppointmentSNSTopic" },
          Protocol: "sqs",
          Endpoint: { "Fn::GetAtt": ["AppointmentQueueCO", "Arn"] },
          FilterPolicy: {
            countryISO: ["CO"],
          },
        },
      },
      AppointmentQueueMXSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          TopicArn: { Ref: "AppointmentSNSTopic" },
          Protocol: "sqs",
          Endpoint: { "Fn::GetAtt": ["AppointmentQueueMX", "Arn"] },
          FilterPolicy: {
            countryISO: ["MX"],
          },
        },
      },
      AppointmentQueuePESubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          TopicArn: { Ref: "AppointmentSNSTopic" },
          Protocol: "sqs",
          Endpoint: { "Fn::GetAtt": ["AppointmentQueuePE", "Arn"] },
          FilterPolicy: {
            countryISO: ["PE"],
          },
        },
      },
      UpdateStatusSNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName:
            "${self:service}-${self:provider.stage}-UpdateStatusSNSTopic",
        },
      },
      UpdateStatusQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:service}-${self:provider.stage}-UpdateStatusQueue",
        },
      },
      UpdateStatusQueueSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          TopicArn: { Ref: "UpdateStatusSNSTopic" },
          Protocol: "sqs",
          Endpoint: { "Fn::GetAtt": ["UpdateStatusQueue", "Arn"] },
        },
      },
      QueuePolicyCO: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "AppointmentQueueCO" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["AppointmentQueueCO", "Arn"] },
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": { Ref: "AppointmentSNSTopic" },
                  },
                },
              },
            ],
          },
        },
      },
      QueuePolicyPE: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "AppointmentQueuePE" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["AppointmentQueuePE", "Arn"] },
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": { Ref: "AppointmentSNSTopic" },
                  },
                },
              },
            ],
          },
        },
      },
      QueuePolicyMX: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "AppointmentQueueMX" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["AppointmentQueueMX", "Arn"] },
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": { Ref: "AppointmentSNSTopic" },
                  },
                },
              },
            ],
          },
        },
      },
      QueueUpdateStatusPolicyMX: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "UpdateStatusQueue" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "sqs:SendMessage",
                Resource: { "Fn::GetAtt": ["UpdateStatusQueue", "Arn"] },
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": { Ref: "UpdateStatusSNSTopic" },
                  },
                },
              },
            ],
          },
        },
      },
      TemplateHTMLBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName:
            "${self:service}-${self:provider.stage}-template-html-bucket",
          WebsiteConfiguration: {
            IndexDocument: "index.html",
            ErrorDocument: "error.html",
          },
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            BlockPublicPolicy: false,
            IgnorePublicAcls: false,
            RestrictPublicBuckets: false,
          },
        },
      },
      TemplateHTMLBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: { Ref: "TemplateHTMLBucket" },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:*",
                Resource: {
                  "Fn::Join": [
                    "",
                    ["arn:aws:s3:::", { Ref: "TemplateHTMLBucket" }, "/*"],
                  ],
                },
              },
            ],
          },
        },
      },
      SentEmailQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:service}-${self:provider.stage}-SentEmailQueue",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
