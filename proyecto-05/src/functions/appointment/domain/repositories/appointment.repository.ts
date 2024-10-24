import { Appointment } from "../roots/appoinment";

export type AppointmentRepository = {
  addItem(item: Appointment): Promise<void>;
  updateStatus(appointmentId: string, status: string): Promise<void>;
};
