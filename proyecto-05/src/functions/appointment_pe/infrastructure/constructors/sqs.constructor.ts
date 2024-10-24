import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export const sqsClient = new SQSClient({});

export class SQSConstructor {
  private readonly client = sqsClient;

  async publishMessage(queueUrl: string, messageBody: string): Promise<any> {
    const command = this.generateCommand(queueUrl, messageBody);
    return this.client.send(command);
  }

  private generateCommand(
    queueUrl: string,
    messageBody: string
  ): SendMessageCommand {
    return new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    });
  }
}
