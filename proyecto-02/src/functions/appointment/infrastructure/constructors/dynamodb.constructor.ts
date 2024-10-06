import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export type ItemPayload = Record<string, AttributeValue>;

export class DynamoDBConstructor {
  private readonly client = new DynamoDBClient();

  private generateCommandUpdate(
    tableName: string,
    appointmentId: string,
    status: string
  ) {
    const params: UpdateItemCommandInput = {
      TableName: tableName,
      Key: { appointmentId: { S: appointmentId } },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": { S: status },
      },
      ReturnValues: "ALL_NEW",
    };

    return new UpdateItemCommand(params);
  }

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

  async updateStatus(appointmentId: string, status: string, tableName: string) {
    const command = this.generateCommandUpdate(
      tableName,
      appointmentId,
      status
    );
    return this.client.send(command);
  }
}
