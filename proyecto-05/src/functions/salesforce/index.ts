import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.salesforce`,
  events: [
    {
      sqs: {
        arn: {
          "Fn::GetAtt": ["AppointmentCreatedQueue", "Arn"],
        },
        batchSize: 1,
      },
    },
  ],
};
