"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"

interface Transaction {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
}

interface RevenueChartProps {
  transactions: Transaction[]
}

export function RevenueChart({ transactions }: RevenueChartProps) {
  const [data, setData] = React.useState<any[]>([])
  const [viewMode, setViewMode] = React.useState<'daily' | 'monthly'>('daily')

  React.useEffect(() => {
    if (viewMode === 'daily') {
      // Get date range for the current month
      const start = startOfMonth(new Date())
      const end = endOfMonth(new Date())
      
      // Create an array of all days in the month
      const days = eachDayOfInterval({ start, end })
      
      // Initialize data for each day
      const dailyData = days.map(day => ({
        name: format(day, 'dd MMM'),
        total: 0
      }))
      
      // Sum up transactions for each day
      transactions.forEach(transaction => {
        if (transaction.status === 'paid') {
          const transactionDate = format(new Date(transaction.date), 'dd MMM')
          const dayData = dailyData.find(d => d.name === transactionDate)
          if (dayData) {
            dayData.total += transaction.amount
          }
        }
      })
      
      setData(dailyData)
    } else {
      // Monthly view logic here if needed
    }
  }, [transactions, viewMode])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rp${value.toLocaleString('id-ID')}`}
              />
              <Tooltip 
                formatter={(value: any) => [`Rp${parseInt(value).toLocaleString('id-ID')}`, 'Revenue']}
              />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}