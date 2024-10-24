import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

import { DynamoDBConstructor } from "./constructors/dynamodb.constructor";

const client = new S3Client();

const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

const getContent = async (bucketName, key) => {
  const input: GetObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
  };
  const command = new GetObjectCommand(input);
  const response = await client.send(command);
  return await streamToString(response.Body);
};

const getInfoPatients = (content) => {
  return content.split("\n").map((line) => line.split(","));
};

const dynamodbConstructor = new DynamoDBConstructor();

const saveInfoPatients = async (infoPatients: any[]) => {
  for (const patient of infoPatients) {
    const [patientId, name, lastname, email] = patient;
    const item = {
      patientId: { N: patientId },
      name: { S: name },
      lastname: { S: lastname },
      email: { S: email },
    };
    const tableName = process.env.PATIENT_TABLE;
    await dynamodbConstructor.addItem(item, tableName);
  }
};

const handler = async (event) => {
  if (event.Records && event.Records.length > 0) {
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const key = record.s3.object.key;

      const content = await getContent(bucketName, key);
      const infoPatients = await getInfoPatients(content);
      await saveInfoPatients(infoPatients);
    }
  }
};

export const updatePatients = handler;
