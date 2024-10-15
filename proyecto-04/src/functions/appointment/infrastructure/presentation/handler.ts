import { EventGatewayHandler } from "./eventHandlers/event-gateway-handler";
import { EventSQSHandler } from "./eventHandlers/event-sqs-handler";

const handler = async (event) => {
  if (event.Records) {
    await EventSQSHandler.execute(event.Records);
  } else {
    await EventGatewayHandler.execute(event.body);
  }

  return {
    statusCode: 200,
    body: "Appointment in progress",
  };
};

export const appointment = handler;
