import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { FinancialTable } from '@/components/ui/financial-table'

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
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            created_at,
            total_amount,
            status,
            user_id,
            auth.users!bookings_user_id_fkey (
              email
            )
          `)
          .order('created_at', { ascending: false })

        // Transform the data to match our Transaction interface
        const transformedData: Transaction[] = data.map(booking => ({
          id: booking.id,
          date: booking.created_at,
          customerName: booking.users?.email || 'Unknown',
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

      <FinancialTable transactions={transactions} />
    </div>
  )
}