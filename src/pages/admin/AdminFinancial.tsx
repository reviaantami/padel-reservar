import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { FinancialTable } from '@/components/ui/financial-table'
import { RevenueChart } from '@/components/ui/revenue-chart'
import { DayStatusChart } from '@/components/ui/day-status-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { format } from 'date-fns'

interface Transaction {
  id: string
  date: string
  customerName: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
}

export default function AdminFinancial() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        // Fetch bookings with their related payment information
        // Get all bookings first
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })

        if (bookingsError) throw bookingsError

        // Get all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')

        if (profilesError) throw profilesError

        // Combine the data
        const data = bookingsData.map(booking => {
          const profile = profilesData.find(p => p.id === booking.user_id)
          return {
            ...booking,
            userProfile: profile
          }
        })

        // Transform the data to match our Transaction interface
        const transformedData: Transaction[] = data.map(booking => ({
          id: booking.id,
          date: booking.created_at,
          customerName: booking.userProfile?.full_name || 'Unknown',
          amount: booking.total_amount,
          status: booking.status === 'paid' ? 'paid' : 
                 booking.status === 'pending' ? 'pending' : 'cancelled'
        }))

        setTransactions(transformedData)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Report</h2>
        <p className="text-muted-foreground">
          Track your income and manage financial records
        </p>
      </div>

      <div className="space-y-4">
        {/* Top row with two charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <DayStatusChart transactions={transactions} />
          <RevenueChart transactions={transactions} />
        </div>

        {/* Transactions table with export button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Riwayat Transaksi</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Create CSV content
                const csvContent = [
                  ["Tanggal", "Customer", "Jumlah", "Status"],
                  ...transactions.map(t => [
                    format(new Date(t.date), "dd/MM/yyyy"),
                    t.customerName,
                    t.amount.toString(),
                    t.status
                  ])
                ]
                .map(row => row.join(","))
                .join("\\n")

                // Create and trigger download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement("a")
                const url = URL.createObjectURL(blob)
                link.setAttribute("href", url)
                link.setAttribute("download", `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <FinancialTable transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}