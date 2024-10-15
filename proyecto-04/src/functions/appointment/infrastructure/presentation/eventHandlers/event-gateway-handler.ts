import { AppoinmentBookApplication } from "@functions/appointment/application/appointment-book.application";
import {
  Appointment,
  AppointmentProps,
} from "@functions/appointment/domain/roots/appoinment";
import { v4 as uuidv4 } from "uuid";

export class EventGatewayHandler {
  static async execute(body: string) {
    const { patientId, scheduleId, insurance, countryISO }: AppointmentProps =
      JSON.parse(body);

    console.log("{ patientId, scheduleId, insurance, countryISO }", {
      patientId,
      scheduleId,
      insurance,
      countryISO,
    });

    const appointment = new Appointment({
      patientId,
      scheduleId,
      insurance,
      countryISO,
      appointmentId: uuidv4(),
    });

    console.log("appointment", appointment);

    const application = new AppoinmentBookApplication();
    await application.execute(appointment);

    return {
      statusCode: 200,
      body: "Appointment in progress",
    };
  }
}
