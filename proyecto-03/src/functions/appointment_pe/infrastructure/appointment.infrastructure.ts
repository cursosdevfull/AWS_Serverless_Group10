import { PublishCommandOutput } from "@aws-sdk/client-sns";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { Parameters } from "./config/parameters";
import { DynamoDBConstructor } from "./constructors/dynamodb.constructor";
import { SNSConstructor } from "./constructors/sns.constructor";
import { SQSConstructor } from "./constructors/sqs.constructor";

export class AppoinmentInfrastructure implements AppointmentRepository {
  private readonly dynamodbConstructor = new DynamoDBConstructor();
  private readonly snsConstructor = new SNSConstructor();
  private readonly sqsConstructor = new SQSConstructor();

  async publishMessage(
    topic: string,
    appointment: Appointment
  ): Promise<PublishCommandOutput> {
    return await this.snsConstructor.publishMessage<Record<string, any>>(
      topic,
      { appointmentId: appointment.appointmentId, status: "COMPLETED" }
    );
  }

  async saveSQS(
    appointment: Appointment,
    patient: { email: string; name: string; lastname: string }
  ): Promise<void> {
    const messageBody = JSON.stringify({
      ...appointment,
      data: patient,
      templateName: "appointment-complete",
      bucketName: "appointment-dev-template-html-bucket",
      subject: "Appointment completed",
    });
    await this.sqsConstructor.publishMessage(
      Parameters.sentEmailQueueUrl,
      messageBody
    );
  }

  async saveDynamoDB(appointment: Appointment): Promise<void> {
    const item = {
      appointmentId: { S: appointment.appointmentId },
      patientId: { N: appointment.patientId.toString() },
      scheduleId: { N: appointment.scheduleId.toString() },
      insurance: { S: JSON.stringify(appointment.insurance) },
      countryISO: { S: appointment.countryISO },
    };
    await this.dynamodbConstructor.addItem(item, Parameters.appointmentTable);
  }

  async getItem(patientId: number): Promise<any> {
    return this.dynamodbConstructor.getItem(patientId, "Patient");
  }

  async addItem(appointment: Appointment): Promise<void> {
    const response_dynamo = await this.saveDynamoDB(appointment);
    console.log("Response Dynamo: ", response_dynamo);

    const response_sns = await this.publishMessage(
      Parameters.appointmentUpdateStatusTopicArn,
      appointment
    );
    console.log("Response SNS: ", response_sns);
    const { Item } = await this.getItem(appointment.patientId);
    const patient: any = unmarshall(Item);
    console.log("Patient: ", patient);
    const response_sqs = await this.saveSQS(appointment, patient);
    console.log("Response SQS: ", response_sqs);
  }
}
