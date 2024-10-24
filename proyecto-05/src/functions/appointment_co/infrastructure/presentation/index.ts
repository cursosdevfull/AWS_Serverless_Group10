import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.appointment`,
  events: [
    {
      sqs: {
        arn: {
          "Fn::GetAtt": ["AppointmentQueueCO", "Arn"],
        },
        batchSize: 1,
      },
    },
  ],
};
