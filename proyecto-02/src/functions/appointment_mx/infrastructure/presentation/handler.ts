import {
  Appointment,
  AppointmentProps,
} from "@functions/appointment_pe/domain/roots/appoinment";

import { AppoinmentBookApplication } from "../../application/appointment-book.application";

const handler = async (event) => {
  console.log("event", event);
  //console.log("parse", JSON.parse(event));
  const {
    patientId,
    scheduleId,
    insurance,
    countryISO,
    appointmentId,
  }: AppointmentProps = event;

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

  return {
    statusCode: 200,
    body: "Appointment in progress",
  };
};

export const appointment = handler;
