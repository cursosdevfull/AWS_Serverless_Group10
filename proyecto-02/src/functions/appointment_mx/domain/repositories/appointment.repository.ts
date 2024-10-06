import { Appointment } from "../roots/appoinment";

export type AppointmentRepository = {
  addItem(item: Appointment): Promise<void>;
};
