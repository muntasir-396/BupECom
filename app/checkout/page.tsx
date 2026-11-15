import { getSession } from '@/lib/auth'
import { ensureSeeded } from '@/lib/seed'
import { CheckoutForm } from '@/components/marketplace/CheckoutForm'

export default async function CheckoutPage() {
  await ensureSeeded()
  const user = await getSession()

  return <CheckoutForm user={user} />
}
