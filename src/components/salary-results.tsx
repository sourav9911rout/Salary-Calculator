"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SalaryResultsData } from "@/lib/types";
import { Calculator, Loader2 } from "lucide-react";

interface SalaryResultsProps {
  results: SalaryResultsData | null;
  isCalculating: boolean;
}

const formatCurrency = (value: number) => {
  return `₹ ${value.toLocaleString("en-IN")}`;
};

const ResultRow = ({ label, value, isSubtle = false }: { label: string; value: string; isSubtle?: boolean }) => (
  <div className={`flex justify-between items-center py-3 ${isSubtle ? 'text-sm' : ''}`}>
    <p className={isSubtle ? "text-muted-foreground" : "text-foreground"}>{label}</p>
    <p className={`font-medium ${isSubtle ? 'text-muted-foreground' : 'text-foreground'}`}>{value}</p>
  </div>
);

export function SalaryResults({ results, isCalculating }: SalaryResultsProps) {
  if (isCalculating) {
    return (
      <Card className="shadow-lg border-2 border-border/60 min-h-[500px] flex items-center justify-center">
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-medium">Calculating Salary...</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please wait while we process the numbers.
          </p>
        </div>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="shadow-lg border-2 border-border/60 min-h-[500px] flex items-center justify-center bg-gray-50/50">
        <div className="text-center p-8">
          <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-foreground font-headline">Salary Breakdown</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Your calculated salary details will appear here once you fill out and submit the form.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-border/60 animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Salary Breakdown</CardTitle>
        <CardDescription>Here is a detailed look at your salary calculation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <h4 className="font-semibold text-primary mt-4 mb-2">Earnings</h4>
            <ResultRow label="New Basic Pay" value={formatCurrency(results.newBasicPay)} />
            <ResultRow label="DA on Basic Pay" value={formatCurrency(results.daOnBasic)} />
            <ResultRow label="Travelling Allowance (TA)" value={formatCurrency(results.ta)} />
            <ResultRow label="DA on TA" value={formatCurrency(results.daOnTa)} />
            <ResultRow label="HPCA" value={formatCurrency(results.hpca)} />
            <ResultRow label="House Rent Allowance (HRA)" value={formatCurrency(results.hra)} />
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center py-3 text-lg font-bold">
                <p>Gross Salary</p>
                <p className="text-accent">{formatCurrency(results.grossSalary)}</p>
            </div>

            <Separator className="my-4" />

            <h4 className="font-semibold text-destructive mt-4 mb-2">Deductions</h4>
            <ResultRow label="NPS (10%)" value={formatCurrency(results.nps)} isSubtle />
            <ResultRow label="Fixed Deduction" value={formatCurrency(results.fixedDeduction)} isSubtle />

            <div className="flex justify-between items-center pt-3 text-md font-semibold">
                <p>Total Deductions</p>
                <p className="text-destructive">{formatCurrency(results.totalDeductions)}</p>
            </div>

            <Separator className="my-4 bg-primary/50 h-[2px] rounded-full" />

            <div className="flex justify-between items-center py-4 text-xl font-extrabold">
                <p>Net Salary</p>
                <p className="text-accent">{formatCurrency(results.netSalary)}</p>
            </div>

        </div>
      </CardContent>
    </Card>
  );
}
