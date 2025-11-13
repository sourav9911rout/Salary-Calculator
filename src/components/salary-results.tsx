"use client";

import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { SalaryResultsData, MonthlySalaryResult } from "@/lib/types";
import { Calculator, Loader2, Download } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const MonthlyBreakdown = ({ result }: { result: MonthlySalaryResult }) => (
    <div className="space-y-2">
        <h4 className="font-semibold text-primary mt-4 mb-2">Earnings</h4>
        <ResultRow label="New Basic Pay" value={formatCurrency(result.newBasicPay)} />
        <ResultRow label="DA on Basic Pay" value={formatCurrency(result.daOnBasic)} />
        <ResultRow label="Travelling Allowance (TA)" value={formatCurrency(result.ta)} />
        <ResultRow label="DA on TA" value={formatCurrency(result.daOnTa)} />
        <ResultRow label="HPCA" value={formatCurrency(result.hpca)} />
        <ResultRow label="House Rent Allowance (HRA)" value={formatCurrency(result.hra)} />
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center py-3 text-lg font-bold">
            <p>Gross Salary</p>
            <p className="text-primary">{formatCurrency(result.grossSalary)}</p>
        </div>

        <Separator className="my-4" />

        <h4 className="font-semibold text-destructive mt-4 mb-2">Deductions</h4>
        <ResultRow label="NPS Employee Contribution (10%)" value={formatCurrency(result.nps)} isSubtle />
        <ResultRow label="NPS Employer Contribution (14%)" value={formatCurrency(result.employerContribution)} isSubtle />
        <ResultRow label="EHS Deduction" value={formatCurrency(result.fixedDeduction)} isSubtle />

        <div className="flex justify-between items-center pt-3 text-md font-semibold">
            <p>Total Deductions</p>
            <p className="text-destructive">{formatCurrency(result.totalDeductions)}</p>
        </div>

        <Separator className="my-4 bg-primary/50 h-[1px] rounded-full" />

        <div className="flex justify-between items-center py-4 text-xl font-extrabold">
            <p>Net Salary</p>
            <p className="text-primary">{formatCurrency(result.netSalary)}</p>
        </div>
    </div>
);


export function SalaryResults({ results, isCalculating }: SalaryResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const input = resultsRef.current;
    if (input) {
      const originalDisplay = input.style.display;
      input.style.display = 'block';

      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 15;
        
        pdf.setFontSize(20);
        pdf.text('7th CPC Salary Calculation', pdfWidth / 2, 10, { align: 'center' });
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        pdf.save("salary-breakdown.pdf");
        
        input.style.display = originalDisplay;
      });
    }
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-2xl">Salary Breakdown</CardTitle>
            <CardDescription>
            {results.monthlyResults.length > 1 
                ? "Here is a detailed look at your salary calculation for each month and the combined total."
                : "Here is a detailed look at your salary calculation."
            }
            </CardDescription>
        </div>
        <Button onClick={handleDownloadPdf} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
        </Button>
      </CardHeader>
      <CardContent ref={resultsRef}>
        {results.monthlyResults.length > 1 && (
            <Accordion type="single" collapsible className="w-full mb-6" defaultValue="item-0">
                {results.monthlyResults.map((result, index) => (
                    <AccordionItem value={`item-${index}`} key={`${result.month}-${result.year}`}>
                        <AccordionTrigger className="text-lg font-semibold">{result.month} {result.year}</AccordionTrigger>
                        <AccordionContent>
                           <MonthlyBreakdown result={result} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        )}

        {results.monthlyResults.length === 1 && <MonthlyBreakdown result={results.monthlyResults[0]} />}
        
        {results.monthlyResults.length > 1 && (
            <div className="mt-8 pt-6 border-t-4 border-primary/20">
                <h3 className="text-2xl font-bold text-accent mb-4">Grand Total</h3>
                 <div className="space-y-2">
                    <h4 className="font-semibold text-primary mt-4 mb-2">Total Earnings</h4>
                    <ResultRow label="Total New Basic Pay" value={formatCurrency(results.totals.newBasicPay)} />
                    <ResultRow label="Total DA on Basic Pay" value={formatCurrency(results.totals.daOnBasic)} />
                    <ResultRow label="Total TA" value={formatCurrency(results.totals.ta)} />
                    <ResultRow label="Total DA on TA" value={formatCurrency(results.totals.daOnTa)} />
                    <ResultRow label="Total HPCA" value={formatCurrency(results.totals.hpca)} />
                    <ResultRow label="Total HRA" value={formatCurrency(results.totals.hra)} />
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center py-3 text-lg font-bold">
                        <p>Total Gross Salary</p>
                        <p className="text-accent">{formatCurrency(results.totals.grossSalary)}</p>
                    </div>

                    <Separator className="my-4" />

                    <h4 className="font-semibold text-destructive mt-4 mb-2">Total Deductions</h4>
                    <ResultRow label="Total NPS Employee Contribution (10%)" value={formatCurrency(results.totals.nps)} isSubtle />
                    <ResultRow label="Total NPS Employer Contribution (14%)" value={formatCurrency(results.totals.employerContribution)} isSubtle />
                    <ResultRow label="Total EHS Deduction" value={formatCurrency(results.totals.fixedDeduction)} isSubtle />

                    <div className="flex justify-between items-center pt-3 text-md font-semibold">
                        <p>Grand Total Deductions</p>
                        <p className="text-destructive">{formatCurrency(results.totals.totalDeductions)}</p>
                    </div>

                    <Separator className="my-4 bg-accent/50 h-[2px] rounded-full" />

                    <div className="flex justify-between items-center py-4 text-2xl font-extrabold">
                        <p>Grand Total Net Salary</p>
                        <p className="text-accent">{formatCurrency(results.totals.netSalary)}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
