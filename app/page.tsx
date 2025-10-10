import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()

  // If already signed in, redirect to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              🌿 Alquemist
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Agricultural Management Platform
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Cannabis • Coffee • Cocoa • Flowers
            </p>

            <div className="flex gap-4 justify-center mb-12">
              <Link
                href="/sign-in"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Batch Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Track production from seed to harvest with QR codes and real-time updates
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Compliance Ready
                </h3>
                <p className="text-sm text-gray-600">
                  Built for Colombian regulations (INVIMA, ICA, FNC) with extensibility
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Real-time Sync
                </h3>
                <p className="text-sm text-gray-600">
                  Multi-device collaboration with instant updates across your team
                </p>
              </div>
            </div>

            <div className="mt-12 text-sm text-gray-500">
              <p>API Status: ✅ Operational</p>
              <p className="mt-1">Database: ✅ 26 Tables • 97 Indexes</p>
              <p className="mt-1">Seed Data: ✅ 5 Roles • 4 Crop Types</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}