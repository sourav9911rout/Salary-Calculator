"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"

interface SalaryFormProps {
  onCalculate: (data: SalaryFormData) => void;
  isCalculating: boolean;
}

export function SalaryForm({ onCalculate, isCalculating }: SalaryFormProps) {
  const form = useForm<z.infer<typeof SalaryFormSchema>>({
    resolver: zodResolver(SalaryFormSchema),
    defaultValues: {
      payLevel: "10",
      basicPay: 56100,
      monthYear: new Date(),
      daysWorked: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
      daPercentage: 50,
      hraPercentage: "30",
    },
  })

  function onSubmit(data: z.infer<typeof SalaryFormSchema>) {
    onCalculate(data);
  }

  const payLevels = Array.from({ length: 18 }, (_, i) => (i + 1).toString());
  const hraOptions = ["10", "20", "30"];

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
                    <FormControl>
                      <Input type="number" placeholder="e.g., 56100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="monthYear"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Month & Year</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMMM yyyy")
                              ) : (
                                <span>Pick a month</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-nav"
                            fromYear={2016}
                            toYear={new Date().getFullYear() + 1}
                            selected={field.value}
                            onSelect={(date) => {
                                field.onChange(date);
                                const daysInMonth = date ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() : 30;
                                form.setValue('daysWorked', daysInMonth);
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("2016-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
            </div>

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
