import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from "@aws-sdk/client-ses";
import { Readable } from "stream";
import * as velocity from "velocityjs";

const clientSES = new SESClient();
const clientS3 = new S3Client();

const streamToString = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

const embedParameters = (htmlContent: string, data: Record<string, string>) => {
  return velocity.render(htmlContent, data);
};

const readFile = async (
  bucketName: string,
  templateName: string,
  data: Record<string, string>
) => {
  const input = {
    Bucket: bucketName,
    Key: `templates/${templateName}/index.html`,
  };
  const command = new GetObjectCommand(input);
  const response = await clientS3.send(command);
  if (response.Body instanceof Readable) {
    const htmlContent = await streamToString(response.Body);
    return embedParameters(htmlContent, data);
  } else {
    console.error("Response body is not a readable stream");
    return null;
  }
};

const processSentEmail = async (
  htmlContent: string,
  destinationEmail: string
) => {
  const input: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [destinationEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlContent,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Test email",
      },
    },
    Source: "cursoawsgroup05@gmail.com",
  };
  const command = new SendEmailCommand(input);
  await clientSES.send(command);
};

const handler = async (event) => {
  if (event.Records && event.Records.length > 0) {
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      const { data, templateName, bucketName } = body;
      console.log({ data, templateName, bucketName });
      const htmlContent = await readFile(bucketName, templateName, data);
      await processSentEmail(htmlContent, data.email);
    }
  }
};

export const sentEmail = handler;
