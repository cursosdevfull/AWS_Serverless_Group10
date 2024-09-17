import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { AppoinmentInfrastructure } from "../infrastructure/appointment.infrastructure";
import { Parameters } from "../infrastructure/config/parameters";

export class AppoinmentBookApplication {
  repository: AppointmentRepository = new AppoinmentInfrastructure();

  private async saveAppointment(appointment: Appointment) {
    const item = {
      appointmentId: { S: appointment.appointmentId },
      patientId: { N: appointment.patientId.toString() },
      scheduleId: { N: appointment.scheduleId.toString() },
      insurance: { S: JSON.stringify(appointment.insurance) },
      countryISO: { S: appointment.countryISO },
    };

    await this.repository.addItem(item, Parameters.appointmentTable);
  }

  async execute(appointment: Appointment) {
    await this.saveAppointment(appointment);
  }
}
