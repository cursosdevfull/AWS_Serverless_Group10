export class Parameters {
  static get region(): string {
    return process.env.REGION || "us-east-1";
  }

  static get appointmentTable(): string {
    return (
      process.env.APPOINTMENT_TABLE_CO || "appointment-dev-AppointmentTable"
    );
  }

  static get appointmentUpdateStatusTopicArn(): string {
    return process.env.UPDATE_STATUS_SNS_TOPIC_ARN;
  }

  static get sentEmailQueueUrl(): string {
    return process.env.SENT_EMAIL_URL;
  }

  static get patientTable(): string {
    return process.env.PATIENT_TABLE;
  }
}
