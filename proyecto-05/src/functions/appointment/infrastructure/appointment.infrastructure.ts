import { InvokeCommandOutput } from "@aws-sdk/client-lambda";
import { PublishCommandOutput } from "@aws-sdk/client-sns";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { Parameters } from "./config/parameters";
import { DynamoDBConstructor } from "./constructors/dynamodb.constructor";
import { EventBridgeConstructor } from "./constructors/event-bridge.constructor";
import { LambdaConstructor } from "./constructors/lambda.constructor";
import { SFNConstructor } from "./constructors/sfn.constructor";
import { SNSConstructor } from "./constructors/sns.constructor";
import { SQSConstructor } from "./constructors/sqs.constructor";

export class AppoinmentInfrastructure implements AppointmentRepository {
  private readonly lambdaConstructor = new LambdaConstructor();
  private readonly dynamodbConstructor = new DynamoDBConstructor();
  private readonly snsConstructor = new SNSConstructor();
  private readonly sqsConstructor = new SQSConstructor();
  private readonly eventBridgeConstructor = new EventBridgeConstructor();
  private readonly sfnConstructor = new SFNConstructor();

  invokeLambda(appointment: Appointment): Promise<InvokeCommandOutput> {
    const lambdaDestination = Parameters.appointmentDestination(
      appointment.countryISO
    );
    return this.lambdaConstructor.invokeLambda(
      lambdaDestination,
      appointment,
      "RequestResponse"
    );
  }

  async publishMessage(
    topic: string,
    appointment: Appointment
  ): Promise<PublishCommandOutput> {
    const messageGroupId = appointment.appointmentId;
    return this.snsConstructor.publishMessage(
      topic,
      appointment,
      messageGroupId,
      appointment.countryISO
    );
  }

  async saveDynamoDB(appointment: Appointment): Promise<void> {
    const item = {
      appointmentId: { S: appointment.appointmentId },
      patientId: { N: appointment.patientId.toString() },
      scheduleId: { N: appointment.scheduleId.toString() },
      insurance: { S: JSON.stringify(appointment.insurance) },
      countryISO: { S: appointment.countryISO },
      status: { S: "IN_PROGRESS" },
    };
    await this.dynamodbConstructor.addItem(item, Parameters.appointmentTable);
  }

  async saveSQS(
    appointment: Appointment,
    patient: { email: string; name: string; lastname: string }
  ): Promise<void> {
    const messageBody = JSON.stringify({
      ...appointment,
      data: patient,
      templateName: "appointment-in-progress",
      bucketName: "appointment-dev-template-html-bucket",
      subject: "Appointment in progress",
    });
    await this.sqsConstructor.publishMessage(
      Parameters.sentEmailQueueUrl,
      messageBody
    );
  }

  async getItem(patientId: number): Promise<any> {
    return this.dynamodbConstructor.getItem(
      patientId,
      process.env.PATIENT_TABLE
    );
  }

  async addItem(appointment: Appointment): Promise<void> {
    const response_sns = await this.publishMessage(
      Parameters.appointmentSNSTopicArn,
      appointment
    );
    await this.sentMessageEventBridge(appointment);
    console.log("appoinment: ", appointment);
    await this.startStateMachine(appointment);
    const response_dynamo = await this.saveDynamoDB(appointment);
    const { Item } = await this.getItem(appointment.patientId);
    console.log("Item: ", Item);
    const patient: any = unmarshall(Item);
    console.log("Patient: ", patient);

    //const response_sqs = await this.saveSQS(appointment, patient);
  }

  async updateStatus(appointmentId: string, status: string): Promise<void> {
    await this.dynamodbConstructor.updateStatus(
      appointmentId,
      status,
      Parameters.appointmentTable
    );
  }

  async startStateMachine(appointment: Appointment): Promise<void> {
    await this.sfnConstructor.startStateMachine(
      process.env.STATE_MACHINE_ARN,
      appointment.countryISO
    );
  }

  async sentMessageEventBridge(appointment: Appointment): Promise<void> {
    const source = "WEB";
    const detailType = "APPOINTMENT_CREATED";
    const detail = {
      appointmentId: appointment.appointmentId,
      patientId: appointment.patientId,
      scheduleId: appointment.scheduleId,
      insurance: appointment.insurance,
      countryISO: appointment.countryISO,
      status: "IN_PROGRESS",
    };
    const eventBusName = process.env.EVENT_BUS_NAME;
    console.log("EventBridge: ", { source, detailType, detail, eventBusName });
    await this.eventBridgeConstructor.sentMessage(
      source,
      detailType,
      detail,
      eventBusName
    );
  }
}
