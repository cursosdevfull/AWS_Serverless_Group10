import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.updatePatients`,
  events: [
    {
      s3: {
        bucket: {
          Ref: "UpdatesBucket",
        },
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: "patients/",
          },
          {
            suffix: ".csv",
          },
        ],
        existing: true,
      },
    },
  ],
};
