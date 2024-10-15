import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.sentEmail`,
  events: [
    {
      sqs: {
        arn: {
          "Fn::GetAtt": ["SentEmailQueue", "Arn"],
        },
        batchSize: 1,
      },
    },
  ],
};
