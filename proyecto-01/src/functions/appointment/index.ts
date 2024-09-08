import { handlerPath } from "@libs/handler-resolver";

import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.appointment`,
  events: [
    {
      http: {
        method: "post",
        path: "appointment",
        request: {
          schemas: {
            "application/json": schema,
          },
        },
      },
    },
  ],
};
