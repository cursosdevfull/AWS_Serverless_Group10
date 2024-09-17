import { PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { InvocationType, InvokeCommandOutput } from "@aws-sdk/client-lambda";

import { ItemPayload } from "../../infrastructure/constructors/dynamodb.constructor";

export type AppointmentRepository = {
  invokeLambda<T>(
    lambdaName: string,
    payload: T,
    invocationType: InvocationType
  ): Promise<InvokeCommandOutput>;

  addItem(item: ItemPayload, tableName: string): Promise<PutItemCommandOutput>;
};
