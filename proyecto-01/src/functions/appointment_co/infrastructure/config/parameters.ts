export class Parameters {
  static get region(): string {
    return process.env.REGION || "us-east-1";
  }

  static get appointmentTable(): string {
    return (
      process.env.APPOINTMENT_TABLE_CO || "appointment-dev-AppointmentTable"
    );
  }
}
