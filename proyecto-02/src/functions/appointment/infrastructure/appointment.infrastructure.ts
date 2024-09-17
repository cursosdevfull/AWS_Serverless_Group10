import { PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { InvocationType, InvokeCommandOutput } from "@aws-sdk/client-lambda";

import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import {
  DynamoDBConstructor,
  ItemPayload,
} from "./constructors/dynamodb.constructor";
import { LambdaConstructor } from "./constructors/lambda.constructor";

export class AppoinmentInfrastructure implements AppointmentRepository {
  private readonly lambdaConstructor = new LambdaConstructor();
  private readonly dynamodbConstructor = new DynamoDBConstructor();

  invokeLambda<T>(
    lambdaName: string,
    payload: T,
    invocationType: InvocationType
  ): Promise<InvokeCommandOutput> {
    return this.lambdaConstructor.invokeLambda(
      lambdaName,
      payload,
      invocationType
    );
  }
  addItem(item: ItemPayload, tableName: string): Promise<PutItemCommandOutput> {
    return this.dynamodbConstructor.addItem(item, tableName);
  }
}
