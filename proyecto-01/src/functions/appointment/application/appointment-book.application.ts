import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { AppoinmentInfrastructure } from "../infrastructure/appointment.infrastructure";
import { Parameters } from "../infrastructure/config/parameters";

export class AppoinmentBookApplication {
  repository: AppointmentRepository = new AppoinmentInfrastructure();

  private async invokeLambda(appointment: Appointment) {
    const lambdaDestination = Parameters.appointmentDestination(
      appointment.countryISO
    );

    await this.repository.invokeLambda(
      lambdaDestination,
      appointment,
      "RequestResponse"
    );
  }

  private async saveAppointment(appointment: Appointment) {
    const item = {
      appointmentId: { S: appointment.appointmentId },
      patientId: { N: appointment.patientId.toString() },
      scheduleId: { N: appointment.scheduleId.toString() },
      insurance: { S: JSON.stringify(appointment.insurance) },
      countryISO: { S: appointment.countryISO },
      status: { S: "IN_PROGRESS" },
    };

    await this.repository.addItem(item, Parameters.appointmentTable);
  }

  async execute(appointment: Appointment) {
    await this.invokeLambda(appointment);
    await this.saveAppointment(appointment);
  }
}
