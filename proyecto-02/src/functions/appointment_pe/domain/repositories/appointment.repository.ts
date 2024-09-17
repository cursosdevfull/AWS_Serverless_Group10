import { PutItemCommandOutput } from "@aws-sdk/client-dynamodb";

import { ItemPayload } from "../../infrastructure/constructors/dynamodb.constructor";

export type AppointmentRepository = {
  addItem(item: ItemPayload, tableName: string): Promise<PutItemCommandOutput>;
};
