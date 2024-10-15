import {
  PublishCommand,
  PublishCommandOutput,
  SNSClient,
} from "@aws-sdk/client-sns";

export const snsClient = new SNSClient({});

export class SNSConstructor {
  private readonly client = snsClient;

  async publishMessage<T>(
    topic: string,
    message: T
  ): Promise<PublishCommandOutput> {
    const command = this.generateCommand(topic, message);
    return this.client.send(command);
  }

  private generateCommand<T>(topic: string, message: T): PublishCommand {
    return new PublishCommand({
      TopicArn: topic,
      Message: JSON.stringify(message),
    });
  }
}
