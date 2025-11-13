"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import type { z } from "zod"
import { Loader2, PlusCircle, XCircle } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

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

const payLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "13A", "14"];


export function SalaryForm({ onCalculate, isCalculating }: SalaryFormProps) {
  const form = useForm<z.infer<typeof SalaryFormSchema>>({
    resolver: zodResolver(SalaryFormSchema),
    defaultValues: {
      payLevel: "5",
      basicPay: 29200,
      daPercentage: 50,
      hraPercentage: "30",
      includeHpca: true,
      includeHra: true,
      months: [{
        month: months[new Date().getMonth()],
        year: new Date().getFullYear(),
        daysWorked: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
      }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "months"
  });

  function onSubmit(data: z.infer<typeof SalaryFormSchema>) {
    onCalculate(data);
  }

  const hraOptions = ["10", "20", "30"];

  const watchPayLevel = form.watch("payLevel");
  const watchIncludeHra = form.watch("includeHra");
  const watchedMonths = form.watch("months");

  const basicPayOptions = payMatrix[watchPayLevel as keyof typeof payMatrix] || [];

  useEffect(() => {
    if (basicPayOptions.length > 0) {
      form.setValue('basicPay', basicPayOptions[0]);
    }
  }, [watchPayLevel, form, basicPayOptions]);

  const handleDateChange = (month: string, year: number, index: number) => {
    if (month && year) {
        const monthIndex = months.indexOf(month);
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        form.setValue(`months.${index}.daysWorked`, daysInMonth);
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
            
            <Separator />
            
            <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                     <FormField
                        control={form.control}
                        name={`months.${index}.month`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Month</FormLabel>
                             <Select onValueChange={(value) => {
                                 field.onChange(value);
                                 handleDateChange(value, watchedMonths[index].year, index);
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
                        name={`months.${index}.year`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                             <Select onValueChange={(value) => {
                                 field.onChange(parseInt(value));
                                 handleDateChange(watchedMonths[index].month, parseInt(value), index);
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
                      <FormField
                        control={form.control}
                        name={`months.${index}.daysWorked`}
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <XCircle className="h-5 w-5" />
                        <span className="sr-only">Remove month</span>
                      </Button>
                  </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => append({ 
                        month: months[new Date().getMonth()], 
                        year: new Date().getFullYear(), 
                        daysWorked: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() 
                    })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Month
                </Button>
            </div>

            <Separator />


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

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="includeHpca"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal mb-0">
                      Include HPCA
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includeHra"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Include HRA
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {watchIncludeHra && (
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
            )}
            
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
