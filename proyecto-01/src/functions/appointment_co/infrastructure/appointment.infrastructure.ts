import { PutItemCommandOutput } from "@aws-sdk/client-dynamodb";

import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import {
  DynamoDBConstructor,
  ItemPayload,
} from "./constructors/dynamodb.constructor";

export class AppoinmentInfrastructure implements AppointmentRepository {
  private readonly dynamodbConstructor = new DynamoDBConstructor();

  addItem(item: ItemPayload, tableName: string): Promise<PutItemCommandOutput> {
    return this.dynamodbConstructor.addItem(item, tableName);
  }
}
