import appointment from "@functions/appointment/infrastructure/presentation";
import appointment_co from "@functions/appointment_co/infrastructure/presentation";
import appointment_mx from "@functions/appointment_mx/infrastructure/presentation";
import appointment_pe from "@functions/appointment_pe/infrastructure/presentation";

import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "appointment",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
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
      APPOINTMENT_CO_URL:
        "${cf:${self:service}-${self:provider.stage}.AppointmentQueueCOUrl}",
      APPOINTMENT_MX_URL:
        "${cf:${self:service}-${self:provider.stage}.AppointmentQueueMXUrl}",
      APPOINTMENT_PE_URL:
        "${cf:${self:service}-${self:provider.stage}.AppointmentQueuePEUrl}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["lambda:InvokeFunction"],
            Resource: "arn:aws:lambda:*:*:*",
          },
          {
            Effect: "Allow",
            Action: ["dynamodb:PutItem"],
            Resource: "arn:aws:dynamodb:*:*:*",
          },
          {
            Effect: "Allow",
            Action: ["sqs:SendMessage"],
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
            ],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { appointment, appointment_pe, appointment_co, appointment_mx },
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
    },
    Outputs: {
      AppointmentQueueCOUrl: {
        Value: {
          Ref: "AppointmentQueueCO",
        },
        Export: {
          Name: "${self:service}-${self:provider.stage}-AppointmentQueueCOUrl",
        },
      },
      AppointmentQueueMXUrl: {
        Value: {
          Ref: "AppointmentQueueMX",
        },
        Export: {
          Name: "${self:service}-${self:provider.stage}-AppointmentQueueMXUrl",
        },
      },
      AppointmentQueuePEUrl: {
        Value: {
          Ref: "AppointmentQueuePE",
        },
        Export: {
          Name: "${self:service}-${self:provider.stage}-AppointmentQueuePEUrl",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
