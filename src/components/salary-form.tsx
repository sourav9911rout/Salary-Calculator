"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SalaryFormSchema, type SalaryFormData } from "@/lib/types"
import { payMatrix } from "@/lib/pay-matrix"
import { useEffect } from "react"

interface SalaryFormProps {
  onCalculate: (data: SalaryFormData) => void;
  isCalculating: boolean;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2016 + 2 }, (_, i) => 2016 + i);


export function SalaryForm({ onCalculate, isCalculating }: SalaryFormProps) {
  const form = useForm<z.infer<typeof SalaryFormSchema>>({
    resolver: zodResolver(SalaryFormSchema),
    defaultValues: {
      payLevel: "10",
      basicPay: 56100,
      month: months[new Date().getMonth()],
      year: new Date().getFullYear(),
      daysWorked: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
      daPercentage: 50,
      hraPercentage: "30",
    },
  })

  function onSubmit(data: z.infer<typeof SalaryFormSchema>) {
    onCalculate(data);
  }

  const payLevels = Object.keys(payMatrix);
  const hraOptions = ["10", "20", "30"];

  const watchPayLevel = form.watch("payLevel");
  const watchMonth = form.watch("month");
  const watchYear = form.watch("year");

  const basicPayOptions = payMatrix[watchPayLevel as keyof typeof payMatrix] || [];

  useEffect(() => {
    if (basicPayOptions.length > 0) {
      form.setValue('basicPay', basicPayOptions[0]);
    }
  }, [watchPayLevel, form, basicPayOptions]);

  const handleDateChange = (month: string, year: number) => {
    if (month && year) {
        const monthIndex = months.indexOf(month);
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        form.setValue('daysWorked', daysInMonth);
    }
  }

  return (
    <Card className="shadow-lg border-2 border-border/60">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Calculation Inputs</CardTitle>
        <CardDescription>Enter your salary details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a pay level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {payLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            Level {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basicPay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Basic Pay</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a basic pay" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {basicPayOptions.map((pay: number) => (
                           <SelectItem key={pay} value={pay.toString()}>
                              {pay.toLocaleString('en-IN')}
                           </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                       <Select onValueChange={(value) => {
                           field.onChange(value);
                           handleDateChange(value, watchYear);
                       }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                       <Select onValueChange={(value) => {
                           field.onChange(parseInt(value));
                           handleDateChange(watchMonth, parseInt(value));
                       }} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="daysWorked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days Worked</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DA Percentage (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hraPercentage"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>HRA Option</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6"
                    >
                      {hraOptions.map((option) => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={option} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option}%
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isCalculating} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Salary'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
