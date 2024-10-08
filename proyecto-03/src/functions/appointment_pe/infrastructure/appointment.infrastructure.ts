import { PublishCommandOutput } from "@aws-sdk/client-sns";

import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { Parameters } from "./config/parameters";
import { DynamoDBConstructor } from "./constructors/dynamodb.constructor";
import { SNSConstructor } from "./constructors/sns.constructor";

export class AppoinmentInfrastructure implements AppointmentRepository {
  private readonly dynamodbConstructor = new DynamoDBConstructor();
  private readonly snsConstructor = new SNSConstructor();

  async publishMessage(
    topic: string,
    appointment: Appointment
  ): Promise<PublishCommandOutput> {
    return await this.snsConstructor.publishMessage<Record<string, any>>(
      topic,
      { appointmentId: appointment.appointmentId, status: "COMPLETED" }
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

  async addItem(appointment: Appointment): Promise<void> {
    const response_dynamo = await this.saveDynamoDB(appointment);
    console.log("Response Dynamo: ", response_dynamo);

    const response_sns = await this.publishMessage(
      Parameters.appointmentUpdateStatusTopicArn,
      appointment
    );
    console.log("Response SNS: ", response_sns);
  }
}
