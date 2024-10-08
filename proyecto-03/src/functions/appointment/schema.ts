export default {
  type: "object",
  properties: {
    patientId: { type: "integer" },
    scheduleId: { type: "integer" },
    countryISO: { enum: ["PE", "CO", "MX"] },
    insurance: {
      type: "object",
      properties: {
        insuranceId: { type: "integer" },
        planId: { type: "integer" },
        copay: { type: "number" },
        deductible: { type: "number" },
      },
      required: ["insuranceId", "planId", "copay", "deductible"],
      additionalProperties: false,
    },
  },
  required: ["patientId", "scheduleId", "insurance", "countryISO"],
  additionalProperties: false,
} as const;
