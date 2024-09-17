import { COUNTRY_ISO } from "@functions/appointment/common/country.enum";

export class Parameters {
  static get region(): string {
    return process.env.REGION || "us-east-1";
  }

  static get appointmentCo(): string {
    return process.env.APPOINTMENT_CO || "appointment-dev-appointment_co";
  }

  static get appointmentMx(): string {
    return process.env.APPOINTMENT_MX || "appointment-dev-appointment_mx";
  }

  static get appointmentPe(): string {
    return process.env.APPOINTMENT_PE || "appointment-dev-appointment_pe";
  }

  static appointmentDestination(country: COUNTRY_ISO): string {
    const lambdasDestination: Record<COUNTRY_ISO, string> = {
      CO: Parameters.appointmentCo,
      MX: Parameters.appointmentMx,
      PE: Parameters.appointmentPe,
    };

    return lambdasDestination[country];
  }

  static get appointmentTable(): string {
    return process.env.APPOINTMENT_TABLE || "appointment-dev-AppointmentTable";
  }
}
