"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface Transaction {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
}

interface DayStatusProps {
  transactions: Transaction[]
}

const COLORS = {
  paid: "#16a34a",
  cancelled: "#dc2626"
}

export function DayStatusChart({ transactions }: DayStatusProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  
  const todayStats = React.useMemo(() => {
    const todayTransactions = transactions.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === today
    )

    const paid = todayTransactions.filter(t => t.status === 'paid')
    const cancelled = todayTransactions.filter(t => t.status === 'cancelled')

    return [
      {
        name: 'Dibayar',
        value: paid.length,
        amount: paid.reduce((sum, t) => sum + t.amount, 0),
        color: COLORS.paid
      },
      {
        name: 'Dibatalkan',
        value: cancelled.length,
        amount: cancelled.reduce((sum, t) => sum + t.amount, 0),
        color: COLORS.cancelled
      }
    ]
  }, [transactions, today])

  const totalTransactions = todayStats.reduce((sum, item) => sum + item.value, 0)
  const totalAmount = todayStats.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Transaksi Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={todayStats}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {todayStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string, props: any) => {
                  const item = todayStats[props.payload.index]
                  return [
                    `${value} transaksi (Rp${item.amount.toLocaleString('id-ID')})`,
                    name
                  ]
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Total Transaksi: {totalTransactions}</p>
          <p className="font-semibold">Total Amount: Rp {totalAmount.toLocaleString('id-ID')}</p>
        </div>
      </CardContent>
    </Card>
  )
}