import { InvokeCommandOutput } from "@aws-sdk/client-lambda";
import { PublishCommandOutput } from "@aws-sdk/client-sns";

import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { Parameters } from "./config/parameters";
import { DynamoDBConstructor } from "./constructors/dynamodb.constructor";
import { LambdaConstructor } from "./constructors/lambda.constructor";
import { SNSConstructor } from "./constructors/sns.constructor";

export class AppoinmentInfrastructure implements AppointmentRepository {
  private readonly lambdaConstructor = new LambdaConstructor();
  private readonly dynamodbConstructor = new DynamoDBConstructor();
  private readonly snsConstructor = new SNSConstructor();

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
    return await this.snsConstructor.publishMessage(
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

  async addItem(appointment: Appointment): Promise<void> {
    const response_sns = await this.publishMessage(
      Parameters.appointmentSNSTopicArn,
      appointment
    );
    const response_dynamo = await this.saveDynamoDB(appointment);
    console.log("Response SNS: ", response_sns);
    console.log("Response Dynamo: ", response_dynamo);
  }

  async updateStatus(appointmentId: string, status: string): Promise<void> {
    await this.dynamodbConstructor.updateStatus(
      appointmentId,
      status,
      Parameters.appointmentTable
    );
  }
}
