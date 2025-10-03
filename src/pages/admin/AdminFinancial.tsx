import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { FinancialTable } from '@/components/ui/financial-table'
import { RevenueChart } from '@/components/ui/revenue-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChart transactions={transactions} />
        </div>
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialTable transactions={transactions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}