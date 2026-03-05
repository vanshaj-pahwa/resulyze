'use client'

import ResumeList from '@/components/dashboard/ResumeList'
import TemplateGallery from '@/components/dashboard/TemplateGallery'
import AnalyticsDashboard, { QuickActions, useAnalytics } from '@/components/analytics/AnalyticsDashboard'

export default function DashboardPage() {
  const { stats, events } = useAnalytics()
  const hasActivity = events.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {hasActivity ? 'Your resume-building activity at a glance.' : 'Get started by picking an action below.'}
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions stats={stats} />

      {/* Two-column: workspace | analytics sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="space-y-8">
          <ResumeList />
          <TemplateGallery />
        </div>

        <aside className="xl:sticky xl:top-20">
          <AnalyticsDashboard />
        </aside>
      </div>
    </div>
  )
}
