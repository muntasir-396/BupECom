import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function SellPage() {
  const user = await getSession()
  if (user?.hasSellerAccount || user?.role === 'ADMIN') {
    redirect('/seller')
  }
  redirect('/?tab=seller')
}
