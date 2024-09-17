import {
  Appointment,
  AppointmentProps,
} from "@functions/appointment/domain/roots/appoinment";
import { v4 as uuidv4 } from "uuid";

import { AppoinmentBookApplication } from "../../application/appointment-book.application";

const handler = async (event) => {
  const { patientId, scheduleId, insurance, countryISO }: AppointmentProps =
    JSON.parse(event.body);

  const appointment = new Appointment({
    patientId,
    scheduleId,
    insurance,
    countryISO,
    appointmentId: uuidv4(),
  });

  const application = new AppoinmentBookApplication();
  await application.execute(appointment);

  return {
    statusCode: 200,
    body: "Appointment in progress",
  };
};

export const appointment = handler;
