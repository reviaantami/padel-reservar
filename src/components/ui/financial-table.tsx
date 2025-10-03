"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Transaction {
  id: string
  date: string
  customerName: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
}

interface FinancialTableProps {
  transactions: Transaction[]
  onFilterChange?: (filteredData: Transaction[]) => void
}

export function FinancialTable({ transactions, onFilterChange }: FinancialTableProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const filteredTransactions = React.useMemo(() => {
    const filtered = !date?.from ? transactions : transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      if (date.from && date.to) {
        const endDate = new Date(date.to)
        endDate.setDate(endDate.getDate() + 1)
        return transactionDate >= date.from && transactionDate <= endDate
      }
      return transactionDate >= date.from
    })

    // Notify parent component about filtered data
    onFilterChange?.(filtered)
    return filtered

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      if (date.from && date.to) {
        // Add one day to include transactions from the end date
        const endDate = new Date(date.to)
        endDate.setDate(endDate.getDate() + 1)
        return transactionDate >= date.from && transactionDate <= endDate
      }
      return transactionDate >= date.from
    })
  }, [transactions, date])

  const totalAmount = React.useMemo(() => {
    return filteredTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [filteredTransactions])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold">Rp {totalAmount.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
              <TableCell>{transaction.customerName}</TableCell>
              <TableCell>Rp {transaction.amount.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  transaction.status === 'paid' && "bg-green-100 text-green-800",
                  transaction.status === 'pending' && "bg-yellow-100 text-yellow-800",
                  transaction.status === 'cancelled' && "bg-red-100 text-red-800"
                )}>
                  {transaction.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}