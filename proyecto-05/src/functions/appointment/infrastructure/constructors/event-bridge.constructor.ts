import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";

export const eventBridgeClient = new EventBridgeClient({});

export class EventBridgeConstructor {
  private readonly client = eventBridgeClient;

  async sentMessage(
    source: string,
    detailType: string,
    detail: Record<string, any>,
    eventBusName: string
  ): Promise<any> {
    const input: PutEventsCommandInput = {
      Entries: [
        {
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: eventBusName,
        },
      ],
    };
    const command = new PutEventsCommand(input);
    return this.client.send(command);
  }
}
