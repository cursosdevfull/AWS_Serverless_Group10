import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { Appointment } from "../domain/roots/appoinment";
import { AppoinmentInfrastructure } from "../infrastructure/appointment.infrastructure";

export class AppoinmentBookApplication {
  repository: AppointmentRepository = new AppoinmentInfrastructure();

  async execute(appointment: Appointment) {
    await this.repository.addItem(appointment);
  }
}
