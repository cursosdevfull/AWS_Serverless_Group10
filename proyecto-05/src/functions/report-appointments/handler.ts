import { unmarshall } from "@aws-sdk/util-dynamodb";

import { DynamoDBConstructor } from "./constructors/dynamodb.constructor";

const dynamodbConstructor = new DynamoDBConstructor();

const getAppointmentsInProgress = async () => {
  const tableName = process.env.APPOINTMENT_TABLE;
  return await dynamodbConstructor.getAppointmentsInProgress(tableName);
};

const handler = async () => {
  const appointments = await getAppointmentsInProgress();
  const { Items } = appointments;
  for (const item of Items) {
    console.log(unmarshall(item));
  }
};

export const reportAppointments = handler;
