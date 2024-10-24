export type InsuranceProps = {
  insuranceId: number;
  planId: number;
  copay: number;
  deductible: number;
};

export class Insurance {
  private insuranceId: number;
  private planId: number;
  private copay: number;
  private deductible: number;

  constructor(payload: InsuranceProps) {
    if (payload.insuranceId <= 0)
      throw new Error("InsuranceId must be greater than 0");
    if (payload.planId <= 0) throw new Error("PlanId must be greater than 0");
    if (payload.copay <= 0) throw new Error("Copay must be greater than 0");
    if (payload.deductible <= 0)
      throw new Error("Deductible must be greater than 0");

    this.insuranceId = payload.insuranceId;
    this.planId = payload.planId;
    this.copay = payload.copay;
    this.deductible = payload.deductible;
  }

  get properties() {
    return {
      insuranceId: this.insuranceId,
      planId: this.planId,
      copay: this.copay,
      deductible: this.deductible,
    };
  }
}
