export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-8 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Account <span className="heading-gradient">Settings</span>
          </h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-xl p-8 space-y-8">
            <div>
              <h3 className="font-heading font-semibold text-gray-900 text-lg mb-4">Profile Information</h3>
              <p className="text-gray-500 text-sm">Profile management features are not available in this version.</p>
            </div>

            <div className="accent-line" />

            <div>
              <h3 className="font-heading font-semibold text-gray-900 text-lg mb-4">Account</h3>
              <p className="text-gray-500 text-sm">Your account is configured with default settings.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
