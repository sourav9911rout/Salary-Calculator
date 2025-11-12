import { z } from "zod";

export const SalaryFormSchema = z.object({
  payLevel: z.string().min(1, "Pay level is required"),
  basicPay: z.coerce.number({invalid_type_error: "Please enter a valid number"}).positive("Basic pay must be a positive number"),
  monthYear: z.date({
    required_error: "Please select a month and year.",
  }),
  daysWorked: z.coerce.number({invalid_type_error: "Please enter a valid number"}).min(0, "Days worked cannot be negative").max(31, "Days worked cannot exceed 31"),
  daPercentage: z.coerce.number({invalid_type_error: "Please enter a valid number"}).min(0, "DA percentage cannot be negative"),
  hraPercentage: z.enum(["10", "20", "30"], {
    required_error: "You need to select an HRA option.",
  }),
}).refine(data => {
  if (data.monthYear) {
    const daysInMonth = new Date(data.monthYear.getFullYear(), data.monthYear.getMonth() + 1, 0).getDate();
    return data.daysWorked <= daysInMonth;
  }
  return true;
}, {
  message: "Days worked cannot exceed days in the selected month",
  path: ["daysWorked"],
});

export type SalaryFormData = z.infer<typeof SalaryFormSchema>;

export type SalaryResultsData = {
  newBasicPay: number;
  daOnBasic: number;
  ta: number;
  daOnTa: number;
  hpca: number;
  hra: number;
  grossSalary: number;
  nps: number;
  fixedDeduction: number;
  totalDeductions: number;
  netSalary: number;
};
