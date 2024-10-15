import { AppoinmentUpdateStatusApplication } from "@functions/appointment/application/appointment-update-status.application";

export class EventSQSHandler {
  static async execute(records: any[]) {
    for (const record of records) {
      console.log("record", record.body);
      const body = JSON.parse(record.body);
      const { appointmentId, status } = JSON.parse(body.Message);

      console.log("Update status", {
        appointmentId,
        status,
      });

      const application = new AppoinmentUpdateStatusApplication();
      await application.execute(appointmentId, status);
    }
  }
}
