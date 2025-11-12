"use client";

import { useState } from "react";
import { SalaryForm } from "@/components/salary-form";
import { SalaryResults } from "@/components/salary-results";
import type { SalaryFormData, SalaryResultsData } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<SalaryResultsData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (data: SalaryFormData) => {
    setIsCalculating(true);
    setResults(null);

    const { basicPay, monthYear, daysWorked, daPercentage, hraPercentage } = data;
    const totalDaysInMonth = new Date(monthYear.getFullYear(), monthYear.getMonth() + 1, 0).getDate();

    const newBasicPay = (basicPay / totalDaysInMonth) * daysWorked;
    const daOnBasic = newBasicPay * (daPercentage / 100);
    
    let ta = 0;
    if (daysWorked > 15) {
      ta = 3600;
    } else {
      ta = (3600 / totalDaysInMonth) * daysWorked;
    }

    const daOnTa = ta * 0.58;

    let hpca = 0;
    if (daysWorked > 15) {
      hpca = 5125;
    } else {
      hpca = (5125 / totalDaysInMonth) * daysWorked;
    }
    
    const hra = newBasicPay * (parseInt(hraPercentage) / 100);

    const grossSalary = newBasicPay + daOnBasic + ta + daOnTa + hpca + hra;

    const fixedDeduction = 250;
    const npsBase = newBasicPay + daOnBasic + ta + daOnTa + hra;
    const nps = npsBase * 0.10;

    const totalDeductions = fixedDeduction + nps;
    const netSalary = grossSalary - totalDeductions;
    
    const finalResults: SalaryResultsData = {
        newBasicPay: Math.round(newBasicPay),
        daOnBasic: Math.round(daOnBasic),
        ta: Math.round(ta),
        daOnTa: Math.round(daOnTa),
        hpca: Math.round(hpca),
        hra: Math.round(hra),
        grossSalary: Math.round(grossSalary),
        nps: Math.round(nps),
        fixedDeduction,
        totalDeductions: Math.round(totalDeductions),
        netSalary: Math.round(netSalary),
    };

    setTimeout(() => {
        setResults(finalResults);
        setIsCalculating(false);
    }, 500);
  };

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-primary tracking-tight font-headline">7th CPC Salary Calculator</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            An intuitive 7th CPC salary calculator. Enter your details to instantly compute your earnings and deductions.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <SalaryForm onCalculate={handleCalculate} isCalculating={isCalculating} />
          </div>
          <div className="lg:col-span-3">
            <SalaryResults results={results} isCalculating={isCalculating} />
          </div>
        </div>
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 7th CPC Salary Calculator. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
}
