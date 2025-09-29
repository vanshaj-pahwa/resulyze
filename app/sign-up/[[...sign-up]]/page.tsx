import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">RESULYZE</h1>
          </div>
          <p className="text-gray-600">Create your account and start optimizing your career today.</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm normal-case",
              card: "shadow-lg border-0 bg-white/80 backdrop-blur-sm",
              headerTitle: "text-gray-800",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
              formFieldInput: "border-gray-200 focus:border-blue-500",
              footerActionLink: "text-blue-600 hover:text-blue-700"
            }
          }}
        />
      </div>
    </div>
  )
}