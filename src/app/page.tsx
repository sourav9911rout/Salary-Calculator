
"use client";

import { useState, useEffect } from "react";
import { SalaryForm } from "@/components/salary-form";
import { SalaryResults } from "@/components/salary-results";
import type { SalaryFormData, SalaryResultsData, MonthlySalaryResult } from "@/lib/types";
import { cities } from "@/lib/cities";
import { higherTptaCities } from "@/lib/ta-cities";
import { CpcSelector } from "@/components/cpc-selector";

export default function Home() {
  const [results, setResults] = useState<SalaryResultsData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [cpcVersion, setCpcVersion] = useState<number | null>(null);
  const [heading, setHeading] = useState("7th CPC Salary Calculator");

  useEffect(() => {
    if (cpcVersion === 8) {
      setHeading("Assumed 8th CPC Salary Calculator");
    } else {
      setHeading("7th CPC Salary Calculator");
    }
  }, [cpcVersion]);

  const getFixedDeduction = (payLevel: string): number => {
    const level = parseInt(payLevel.replace('A', ''));
    if (level <= 5) return 250;
    if (level === 6) return 450;
    if (level >= 7 && level <= 11) return 650;
    if (level >= 12) return 1000;
    return 250;
  };

  const getTaAmount = (payLevel: string, taCity: string): number => {
    const isHigherTpta = higherTptaCities.includes(taCity);
    const level = parseInt(payLevel.replace('A', ''));
    if (isHigherTpta) {
      if (level >= 9) return 7200;
      if (level >= 3) return 3600;
      return 1350;
    } else { // other
      if (level >= 9) return 3600;
      if (level >= 3) return 1800;
      return 900;
    }
  };

  const getHraPercentage = (city: string): number => {
    const selectedCity = cities.find(c => c.name === city);
    if (!selectedCity) return 10; // Default to Z category
    if (selectedCity.category === 'X') return 30;
    if (selectedCity.category === 'Y') return 20;
    return 10; // Z category
  }


  const handleCalculate = (data: SalaryFormData) => {
    setIsCalculating(true);
    setResults(null);

    let { basicPay, daPercentage, includeHpca, includeSda, includeHra, months, payLevel, taCity, city, fitmentFactor, hraPercentage } = data;

    if (cpcVersion === 8) {
      daPercentage = 0;
    }

    const finalBasicPay = cpcVersion === 8 && fitmentFactor ? basicPay * fitmentFactor : basicPay;

    const monthlyResults: MonthlySalaryResult[] = months.map(monthEntry => {
      const { month, year, daysWorked } = monthEntry;
      const monthIndex = new Date(Date.parse(month +" 1, 2012")).getMonth();
      const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const newBasicPay = (finalBasicPay / totalDaysInMonth) * daysWorked;
      const daOnBasic = newBasicPay * (daPercentage / 100);
      
      const npsBase = newBasicPay + daOnBasic;
      const nps = npsBase * 0.10;
      const employerContribution = npsBase * 0.14;
      
      const baseTa = getTaAmount(payLevel, taCity);
      const ta = (baseTa / totalDaysInMonth) * daysWorked;

      const daOnTa = ta * (daPercentage / 100);

      let hpca = 0;
      if (includeHpca) {
          const baseHpca = 5125;
          hpca = (baseHpca / totalDaysInMonth) * daysWorked;
      }
      
      let sda = 0;
      if (includeSda) {
        sda = newBasicPay * 0.10;
      }

      let hra = 0;
      if (includeHra) {
        const finalHraPercentage = hraPercentage !== undefined ? hraPercentage : getHraPercentage(city);
        hra = newBasicPay * (finalHraPercentage / 100);
      }

      const grossSalary = newBasicPay + daOnBasic + ta + daOnTa + hpca + sda + hra + employerContribution;

      const fixedDeduction = getFixedDeduction(payLevel);
      
      const totalDeductions = nps + employerContribution + fixedDeduction;
      const netSalary = grossSalary - totalDeductions;
      
      return {
          month,
          year,
          newBasicPay: Math.round(newBasicPay),
          daOnBasic: Math.round(daOnBasic),
          employerContribution: Math.round(employerContribution),
          ta: Math.round(ta),
          daOnTa: Math.round(daOnTa),
          hpca: Math.round(hpca),
          sda: Math.round(sda),
          hra: Math.round(hra),
          grossSalary: Math.round(grossSalary),
          nps: Math.round(nps),
          fixedDeduction,
          totalDeductions: Math.round(totalDeductions),
          netSalary: Math.round(netSalary),
      };
    });

    const totals = monthlyResults.reduce((acc, current) => {
        acc.newBasicPay += current.newBasicPay;
        acc.daOnBasic += current.daOnBasic;
        acc.employerContribution += current.employerContribution;
        acc.ta += current.ta;
        acc.daOnTa += current.daOnTa;
        acc.hpca += current.hpca;
        acc.sda += current.sda;
        acc.hra += current.hra;
        acc.grossSalary += current.grossSalary;
        acc.nps += current.nps;
        acc.fixedDeduction += current.fixedDeduction;
        acc.totalDeductions += current.totalDeductions;
        acc.netSalary += current.netSalary;
        return acc;
    }, {
        newBasicPay: 0,
        daOnBasic: 0,
        employerContribution: 0,
        ta: 0,
        daOnTa: 0,
        hpca: 0,
        sda: 0,
        hra: 0,
        grossSalary: 0,
        nps: 0,
        fixedDeduction: 0,
        totalDeductions: 0,
        netSalary: 0,
    });

    const finalResults: SalaryResultsData = {
        monthlyResults,
        totals,
    };

    setTimeout(() => {
        setResults(finalResults);
        setIsCalculating(false);
    }, 500);
  };
  
  if (!cpcVersion) {
    return <CpcSelector onSelect={setCpcVersion} />;
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-primary tracking-tight font-headline">{heading}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            An intuitive CPC salary calculator. Enter your details to instantly compute your earnings and deductions.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <SalaryForm onCalculate={handleCalculate} isCalculating={isCalculating} cpcVersion={cpcVersion} />
          </div>
          <div className="lg:col-span-3">
            <SalaryResults results={results} isCalculating={isCalculating} />
          </div>
        </div>
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 7th CPC Salary Calculator. All Rights Reserved.</p>
          <div className="flex justify-center items-center gap-2 mt-2 text-xs">
            <p className="font-credit">Made by Sourav Kumar Rout with</p>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block h-4 w-4"
            >
              <path
                d="M22.56 12.25C22.56 11.42 22.49 10.61 22.36 9.82H12.24V14.45H18.06C17.82 16.03 16.99 17.34 15.65 18.27V21.1H19.5C21.52 19.16 22.56 16.08 22.56 12.25Z"
                fill="#4285F4"
              />
              <path
                d="M12.24 23C15.24 23 17.82 22.01 19.5 20.43L15.65 17.55C14.65 18.23 13.52 18.63 12.24 18.63C9.72 18.63 7.59 17.04 6.78 14.81H2.81V17.7C4.54 20.84 8.1 23 12.24 23Z"
                fill="#34A853"
              />
              <path
                d="M6.78 14.81C6.59 14.22 6.48 13.6 6.48 12.96C6.48 12.32 6.59 11.7 6.78 11.11V8.22H2.81C1.96 9.87 1.44 11.72 1.44 13.68C1.44 15.64 1.96 17.49 2.81 19.14L6.78 16.26V14.81Z"
                fill="#FBBC05"
              />
              <path
                d="M12.24 6.36C13.63 6.36 14.93 6.86 15.96 7.84L19.58 4.22C17.82 2.59 15.24 1.5 12.24 1.5C8.1 1.5 4.54 3.66 2.81 6.8L6.78 9.68C7.59 7.45 9.72 5.86 12.24 5.86V6.36Z"
                fill="#EA4335"
              />
            </svg>
            <p className="font-credit">Firebase Studio</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

    
