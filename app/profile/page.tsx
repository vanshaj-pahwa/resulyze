import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { UserProfile } from '@clerk/nextjs'

export default function ProfilePage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">RESULYZE</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h2>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
          
          <UserProfile 
            appearance={{
              elements: {
                card: "shadow-lg border-0 bg-white/80 backdrop-blur-sm",
                navbar: "bg-white/60",
                navbarButton: "text-gray-700 hover:bg-gray-100",
                navbarButtonActive: "bg-blue-100 text-blue-700",
                formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                formFieldInput: "border-gray-200 focus:border-blue-500",
                headerTitle: "text-gray-800",
                headerSubtitle: "text-gray-600"
              }
            }}
          />
        </div>
      </main>
    </div>
  )
}