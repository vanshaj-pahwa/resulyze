import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <DashboardClient />
}