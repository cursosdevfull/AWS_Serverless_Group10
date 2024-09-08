import {
  InvokeCommand,
  InvokeCommandInput,
  LambdaClient,
} from "@aws-sdk/client-lambda";

enum COUNTRY_ISO {
  CO = "CO",
  MX = "MX",
  PE = "PE",
}

const lambdasDestination = {
  CO: "appointment-dev-appointment_co",
  MX: "appointment-dev-appointment_mx",
  PE: "appointment-dev-appointment_pe",
};

const getLambdaDestination = (countryISO: COUNTRY_ISO) => {
  return lambdasDestination[countryISO];
};

type InsuracePayload = {
  insuranceId: number;
  planId: number;
  copay: number;
  deductible: number;
};

type AppointmentPayload = {
  patientId: number;
  scheduleId: number;
  insurance: InsuracePayload;
  countryISO: COUNTRY_ISO;
};

const invokeLambda = async (
  lambdaDestination: string,
  payload: AppointmentPayload
) => {
  const client = new LambdaClient();
  const input: InvokeCommandInput = {
    FunctionName: lambdaDestination,
    InvocationType: "RequestResponse",
    Payload: JSON.stringify(payload),
  };
  console.log("input", input);
  const command = new InvokeCommand(input);
  await client.send(command);
};

const handler = async (event) => {
  const payload: AppointmentPayload = JSON.parse(event.body);

  const lambdaDestination = getLambdaDestination(payload.countryISO);

  await invokeLambda(lambdaDestination, payload);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from the appointment handler",
    }),
  };
};

export const appointment = handler;
