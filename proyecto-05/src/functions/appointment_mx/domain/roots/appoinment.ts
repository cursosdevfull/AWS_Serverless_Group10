import { COUNTRY_ISO } from "@functions/appointment/common/country.enum";

import { Insurance } from "../entities/insurance";

export type AppointmentPropsRequired = {
  patientId: number;
  scheduleId: number;
  insurance: Insurance;
  countryISO: COUNTRY_ISO;
};

export type AppointmentPropsOptional = {
  appointmentId: string;
};

export type AppointmentProps = AppointmentPropsRequired &
  Partial<AppointmentPropsOptional>;

export class Appointment {
  appointmentId: string;
  patientId: number;
  scheduleId: number;
  insurance: Insurance;
  countryISO: COUNTRY_ISO;

  constructor(payload: AppointmentProps) {
    if (payload.patientId <= 0)
      throw new Error("PatientId must be greater than 0");
    if (payload.scheduleId <= 0)
      throw new Error("ScheduleId must be greater than 0");

    this.appointmentId = payload.appointmentId;
    this.patientId = payload.patientId;
    this.scheduleId = payload.scheduleId;
    this.insurance = payload.insurance;
    this.countryISO = payload.countryISO;
  }
}
