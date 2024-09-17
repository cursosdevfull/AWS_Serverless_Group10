import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export type ItemPayload = Record<string, AttributeValue>;

export class DynamoDBConstructor {
  private readonly client = new DynamoDBClient();

  private generateCommandPut(
    tableName: string,
    item: ItemPayload
  ): PutItemCommand {
    const params: PutItemCommandInput = {
      TableName: tableName,
      Item: item,
    };
    return new PutItemCommand(params);
  }

  async addItem(item: ItemPayload, tableName: string) {
    const command = this.generateCommandPut(tableName, item);
    return this.client.send(command);
  }
}
