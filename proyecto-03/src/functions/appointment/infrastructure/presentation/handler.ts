import { EventGatewayHandler } from "./eventHandlers/event-gateway-handler";
import { EventSQSHandler } from "./eventHandlers/event-sqs-handler";

const handler = async (event) => {
  if (event.Records) {
    EventSQSHandler.execute(event.Records);
  } else {
    EventGatewayHandler.execute(event.body);
  }
};

export const appointment = handler;
