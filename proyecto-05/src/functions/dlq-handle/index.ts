import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.dlqHandle`,
  events: [
    {
      sqs: {
        arn: {
          "Fn::GetAtt": ["DLQQueue", "Arn"],
        },
        batchSize: 1,
      },
    },
  ],
};
