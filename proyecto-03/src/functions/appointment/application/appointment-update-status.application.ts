import { AppointmentRepository } from "../domain/repositories/appointment.repository";
import { AppoinmentInfrastructure } from "../infrastructure/appointment.infrastructure";

export class AppoinmentUpdateStatusApplication {
  repository: AppointmentRepository = new AppoinmentInfrastructure();

  async execute(appointmentId: string, status: string) {
    await this.repository.updateStatus(appointmentId, status);
  }
}
