import appointment from "@functions/appointment/infrastructure/presentation";
import appointment_co from "@functions/appointment_co/infrastructure/presentation";
import appointment_mx from "@functions/appointment_mx/infrastructure/presentation";
import appointment_pe from "@functions/appointment_pe/infrastructure/presentation";
import dlqHandle from "@functions/dlq-handle";
import reportAppointments from "@functions/report-appointments";
import salesforce from "@functions/salesforce";
import sentEmail from "@functions/sent-email";
import step01 from "@functions/step01";
import step02 from "@functions/step02";
import step03 from "@functions/step03";
import updatePatients from "@functions/update-patients";

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
      PATIENT_TABLE: "${self:service}-${self:provider.stage}-PatientTable",
      DLQ_TABLE: "${self:service}-${self:provider.stage}-DlqTable",
      APPOINTMENT_CO_URL: { Ref: "AppointmentQueueCO" },
      APPOINTMENT_MX_URL: { Ref: "AppointmentQueueMX" },
      APPOINTMENT_PE_URL: { Ref: "AppointmentQueuePE" },
      SENT_EMAIL_URL: { Ref: "SentEmailQueue" },
      DLQ_URL: { Ref: "DLQQueue" },
      SNS_TOPIC_ARN: { Ref: "AppointmentSNSTopic" },
      UPDATE_STATUS_SNS_TOPIC_ARN: { Ref: "UpdateStatusSNSTopic" },
      UPDATE_BUCKET: { Ref: "UpdatesBucket" },
      EVENT_BUS_NAME: { Ref: "EventBusAppointment" },
      STATE_MACHINE_ARN: { Ref: "AppointmentStateMachine" },
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
            Action: ["states:StartExecution"],
            Resource: "arn:aws:states:*:*:*",
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:GetItem",
              "dynamodb:Scan",
            ],
            Resource: "arn:aws:dynamodb:*:*:*",
          },
          {
            Effect: "Allow",
            Action: "events:PutEvents",
            Resource: "*",
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
    dlqHandle,
    updatePatients,
    reportAppointments,
    salesforce,
    step01,
    step02,
    step03,
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
      PatientTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:service}-${self:provider.stage}-PatientTable",
          AttributeDefinitions: [
            {
              AttributeName: "patientId",
              AttributeType: "N",
            },
          ],
          KeySchema: [
            {
              AttributeName: "patientId",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
      DLQTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:service}-${self:provider.stage}-DlqTable",
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
          RedrivePolicy: {
            deadLetterTargetArn: { "Fn::GetAtt": ["DLQQueue", "Arn"] },
            maxReceiveCount: 1,
          },
        },
      },
      AppointmentQueueMX: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName:
            "${self:service}-${self:provider.stage}-AppointmentQueue-mx.fifo",
          FifoQueue: true,
          ContentBasedDeduplication: true,
          RedrivePolicy: {
            deadLetterTargetArn: { "Fn::GetAtt": ["DLQQueue", "Arn"] },
            maxReceiveCount: 1,
          },
        },
      },
      AppointmentQueuePE: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName:
            "${self:service}-${self:provider.stage}-AppointmentQueue-pe.fifo",
          FifoQueue: true,
          ContentBasedDeduplication: true,
          RedrivePolicy: {
            deadLetterTargetArn: { "Fn::GetAtt": ["DLQQueue", "Arn"] },
            maxReceiveCount: 1,
          },
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
      DLQQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:service}-${self:provider.stage}-DLQQueue.fifo",
          FifoQueue: true,
          ContentBasedDeduplication: true,
        },
      },
      UpdatesBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:service}-${self:provider.stage}-updates-bucket",
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            BlockPublicPolicy: false,
            IgnorePublicAcls: false,
            RestrictPublicBuckets: false,
          },
        },
      },
      UpdatesBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: { Ref: "UpdatesBucket" },
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
                    ["arn:aws:s3:::", { Ref: "UpdatesBucket" }, "/*"],
                  ],
                },
              },
            ],
          },
        },
      },
      AppointmentCreatedQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName:
            "${self:service}-${self:provider.stage}-AppointmentCreatedQueue",
        },
      },
      EventBusAppointment: {
        Type: "AWS::Events::EventBus",
        Properties: {
          Name: "${self:service}-${self:provider.stage}-EventBusAppointment",
        },
      },
      EventBusAppointmentRule: {
        Type: "AWS::Events::Rule",
        Properties: {
          Name: "${self:service}-${self:provider.stage}-EventBusAppointmentRule",
          EventBusName: { Ref: "EventBusAppointment" },
          EventPattern: {
            source: ["WEB", "MOBILE"],
            "detail-type": ["APPOINTMENT_CREATED"],
          },
          Targets: [
            {
              Arn: { "Fn::GetAtt": ["AppointmentCreatedQueue", "Arn"] },
              Id: "AppointmentCreatedQueue",
            },
          ],
        },
      },
      AppointmentCreatedQueuePermissions: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          Queues: [{ Ref: "AppointmentCreatedQueue" }],
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { Service: "events.amazonaws.com" },
                Action: "sqs:*",
                Resource: { "Fn::GetAtt": ["AppointmentCreatedQueue", "Arn"] },
              },
            ],
          },
        },
      },
      StepQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:service}-${self:provider.stage}-StepQueue",
        },
      },

      StateMachineRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "states.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "StateMachinePolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
                    Resource: "arn:aws:lambda:*:*:*",
                  },
                  {
                    Effect: "Allow",
                    Action: [
                      "sqs:SendMessage",
                      "sqs:ReceiveMessage",
                      "sqs:DeleteMessage",
                      "sqs:GetQueueAttributes",
                    ],
                    Resource: "arn:aws:sqs:*:*:*",
                  },
                  {
                    Effect: "Allow",
                    Action: ["sns:Publish"],
                    Resource: "arn:aws:sns:*:*:*",
                  },
                  {
                    Effect: "Allow",
                    Action: [
                      "dynamodb:PutItem",
                      "dynamodb:UpdateItem",
                      "dynamodb:GetItem",
                      "dynamodb:Scan",
                    ],
                    Resource: "arn:aws:dynamodb:*:*:*",
                  },
                  {
                    Effect: "Allow",
                    Action: ["s3:GetObject", "s3:PutObject"],
                    Resource: "arn:aws:s3:::*",
                  },
                ],
              },
            },
          ],
        },
      },
      AppointmentStateMachine: {
        Type: "AWS::StepFunctions::StateMachine",
        Properties: {
          StateMachineName:
            "${self:service}-${self:provider.stage}-AppointmentStateMachine",
          Definition: {
            Comment:
              "Process to create an appointment and send an email to the patient",
            StartAt: "Choice",
            States: {
              Choice: {
                Type: "Choice",
                Choices: [
                  {
                    Variable: "$.countryISO",
                    StringEquals: "CO",
                    Next: "TasksInParallel",
                  },
                  {
                    Not: {
                      Variable: "$.countryISO",
                      StringEquals: "CO",
                    },
                    Next: "TaskInStep03",
                  },
                ],
              },
              TasksInParallel: {
                Type: "Parallel",
                Branches: [
                  {
                    StartAt: "TaskInStep01",
                    States: {
                      TaskInStep01: {
                        Type: "Task",
                        Resource:
                          "arn:aws:lambda:us-east-1:282865065290:function:appointment-dev-step01",
                        End: true,
                      },
                    },
                  },
                  {
                    StartAt: "TaskInStep02",
                    States: {
                      TaskInStep02: {
                        Type: "Task",
                        Resource:
                          "arn:aws:lambda:us-east-1:282865065290:function:appointment-dev-step02",
                        End: true,
                      },
                    },
                  },
                ],
                End: true,
              },
              TaskInStep03: {
                Type: "Task",
                Resource:
                  "arn:aws:lambda:us-east-1:282865065290:function:appointment-dev-step03",
                Next: "SQSStep",
              },
              SQSStep: {
                Type: "Task",
                Resource: "arn:aws:states:::sqs:sendMessage",
                Parameters: {
                  "MessageBody.$": "$",
                  QueueUrl:
                    "https://sqs.us-east-1.amazonaws.com/282865065290/appointment-dev-StepQueue",
                },
                End: true,
              },
            },
          },
          RoleArn: {
            "Fn::GetAtt": ["StateMachineRole", "Arn"],
          },
        },
      },
      AppointmentCognitoUserPool: {
        Type: "AWS::Cognito::UserPool",
        Properties: {
          UserPoolName: "${self:service}-${self:provider.stage}-UserPool",
          UsernameAttributes: ["email"],
          AutoVerifiedAttributes: ["email"],
          EmailVerificationSubject: "Verificación necesaria",
          EmailVerificationMessage:
            "Gracias por registrarte en nuestra plataforma, por favor verifica tu correo electrónico usando el siguiente código: {####}",
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireLowercase: false,
              RequireNumbers: false,
              RequireSymbols: false,
              RequireUppercase: false,
            },
          },
        },
      },
      AppointmentCognitoUserPoolClient: {
        Type: "AWS::Cognito::UserPoolClient",
        Properties: {
          ClientName: "${self:service}-${self:provider.stage}-UserPoolClient",
          UserPoolId: { Ref: "AppointmentCognitoUserPool" },
          GenerateSecret: false,
          ExplicitAuthFlows: [
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
