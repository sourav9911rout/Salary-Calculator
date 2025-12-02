import { z } from "zod";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

export const MonthEntrySchema = z.object({
  month: z.enum(months),
  year: z.coerce.number(),
  daysWorked: z.coerce.number({invalid_type_error: "Please enter a valid number"}).min(0, "Days worked cannot be negative").max(31, "Days worked cannot exceed 31"),
});

export const SalaryFormSchema = z.object({
  payLevel: z.string().min(1, "Pay level is required"),
  basicPay: z.coerce.number({invalid_type_error: "Please enter a valid number"}).positive("Basic pay must be a positive number"),
  daPercentage: z.coerce.number({invalid_type_error: "Please enter a valid number"}).min(0, "DA percentage cannot be negative"),
  taCity: z.string().min(1, "Transport Allowance city is required"),
  includeHpca: z.boolean().default(false),
  includeSda: z.boolean().default(false),
  includeHra: z.boolean().default(false),
  city: z.string().min(1, "City is required when HRA is included"),
  months: z.array(MonthEntrySchema).min(1, "At least one month is required."),
}).refine(data => {
  for (const monthEntry of data.months) {
    if (monthEntry.year && monthEntry.month) {
      const monthIndex = months.indexOf(monthEntry.month);
      const daysInMonth = new Date(monthEntry.year, monthIndex + 1, 0).getDate();
      if (monthEntry.daysWorked > daysInMonth) {
        return false;
      }
    }
  }
  return true;
}, {
  message: "Days worked cannot exceed days in the selected month",
  path: ["months"],
});

export type SalaryFormData = z.infer<typeof SalaryFormSchema>;

export type MonthlySalaryResult = {
  month: string;
  year: number;
  newBasicPay: number;
  daOnBasic: number;
  employerContribution: number;
  ta: number;
  daOnTa: number;
  hpca: number;
  sda: number;
  hra: number;
  grossSalary: number;
  nps: number;
  fixedDeduction: number;
  totalDeductions: number;
  netSalary: number;
};

export type SalaryResultsData = {
  monthlyResults: MonthlySalaryResult[];
  totals: Omit<MonthlySalaryResult, 'month' | 'year'>;
};
