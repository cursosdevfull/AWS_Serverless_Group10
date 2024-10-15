import {
  Appointment,
  AppointmentProps,
} from "@functions/appointment_co/domain/roots/appoinment";

import { AppoinmentBookApplication } from "../../application/appointment-book.application";

const handler = async (event) => {
  if (Math.random() > 0.5) {
    throw new Error("An error occurred");
  }

  for (const record of event.Records) {
    const message = JSON.parse(JSON.parse(record.body).Message);
    const {
      patientId,
      scheduleId,
      insurance,
      countryISO,
      appointmentId,
    }: AppointmentProps = message;

    console.log({
      patientId,
      scheduleId,
      insurance,
      countryISO,
      appointmentId,
    });

    const appointment = new Appointment({
      patientId,
      scheduleId,
      insurance,
      countryISO,
      appointmentId,
    });

    const application = new AppoinmentBookApplication();
    await application.execute(appointment);
  }

  return {
    statusCode: 200,
    body: "Appointment in progress",
  };
};

export const appointment = handler;
