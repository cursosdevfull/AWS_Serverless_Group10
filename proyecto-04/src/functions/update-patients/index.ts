import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.updatePatients`,
  events: [
    {
      s3: {
        bucket: "",
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: "patients/",
          },
          {
            suffix: ".csv",
          },
        ],
      },
    },
  ],
};
