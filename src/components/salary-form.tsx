

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SalaryFormSchema, type SalaryFormData } from "@/lib/types"
import { payMatrix } from "@/lib/pay-matrix"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cities } from "@/lib/cities"
import { allTaCities } from "@/lib/ta-cities"

interface SalaryFormProps {
  onCalculate: (data: SalaryFormData) => void;
  isCalculating: boolean;
  cpcVersion: number;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2016 + 2 }, (_, i) => 2016 + i);

const payLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "13A", "14"];

const otherCity = cities.find(c => c.name === 'Other Cities');
const sortedCities = [
  ...cities.filter(c => c.name !== 'Other Cities').sort((a, b) => a.name.localeCompare(b.name)),
  ...(otherCity ? [otherCity] : [])
];

const getHraPercentageFromCategory = (category: string) => {
    switch (category) {
        case "X": return 30;
        case "Y": return 20;
        case "Z": return 10;
        default: return 10;
    }
}


export function SalaryForm({ onCalculate, isCalculating, cpcVersion }: SalaryFormProps) {
  const form = useForm<z.infer<typeof SalaryFormSchema>>({
    resolver: zodResolver(SalaryFormSchema),
    defaultValues: {
      payLevel: "5",
      basicPay: 29200,
      fitmentFactor: cpcVersion === 8 ? 2.57 : undefined,
      daPercentage: cpcVersion === 8 ? 0 : 58,
      taCity: "Other Places",
      city: "Other Cities",
      hraPercentage: 10,
      includeHpca: true,
      includeSda: false,
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

  const watchPayLevel = form.watch("payLevel");
  const watchIncludeHra = form.watch("includeHra");
  const watchedMonths = form.watch("months");
  const watchCity = form.watch("city");
  const watchBasicPay = form.watch("basicPay");
  const watchFitmentFactor = form.watch("fitmentFactor");

  const [cityCategory, setCityCategory] = useState("Z");
  const [calculated8thCpcBasicPay, setCalculated8thCpcBasicPay] = useState<number | null>(null);

  useEffect(() => {
    if (cpcVersion === 8) {
      form.setValue('daPercentage', 0);
    } else {
      form.setValue('daPercentage', 58);
    }
  }, [cpcVersion, form]);

  useEffect(() => {
    if (cpcVersion === 8 && watchBasicPay && watchFitmentFactor) {
      setCalculated8thCpcBasicPay(watchBasicPay * watchFitmentFactor);
    } else {
      setCalculated8thCpcBasicPay(null);
    }
  }, [cpcVersion, watchBasicPay, watchFitmentFactor]);


  useEffect(() => {
    const selectedCity = cities.find(c => c.name === watchCity);
    const category = selectedCity ? selectedCity.category : "Z";
    setCityCategory(category);
    const percentage = getHraPercentageFromCategory(category);
    form.setValue('hraPercentage', percentage);
  }, [watchCity, form]);

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
              {cpcVersion === 8 && (
                <FormField
                  control={form.control}
                  name="fitmentFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitment Factor</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2.57" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              </div>
              <FormField
                control={form.control}
                name="basicPay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cpcVersion === 8 ? '7th CPC Basic Pay' : 'Current Basic Pay'}</FormLabel>
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

              {cpcVersion === 8 && calculated8thCpcBasicPay !== null && (
                 <FormItem>
                    <FormLabel>8th CPC Basic Pay (Calculated)</FormLabel>
                    <Input
                      disabled
                      value={Math.round(calculated8thCpcBasicPay).toLocaleString('en-IN')}
                      className="font-bold"
                    />
                 </FormItem>
              )}
            
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
                              <Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
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

            {cpcVersion === 8 ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border border-dashed">
                Dearness Allowance (DA) is assumed to be 0% for the 8th CPC calculation.
              </div>
            ) : (
              <FormField
                control={form.control}
                name="daPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DA Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="taCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport Allowance City</FormLabel>
                   {cpcVersion === 8 && (
                    <FormDescription>
                      ( Assuming TA will be same as 7th CPC )
                    </FormDescription>
                  )}
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city for TA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allTaCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                name="includeSda"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Include Special Duty Allowance (SDA)
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HRA City</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sortedCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>City Category</FormLabel>
                  <Input value={cityCategory} disabled className="font-bold text-center" />
                </FormItem>
                <FormField
                    control={form.control}
                    name="hraPercentage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>HRA Percentage (%)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 30" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
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
