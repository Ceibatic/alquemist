import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CreateOrganization } from '@clerk/nextjs'

export default async function CreateOrganizationPage() {
  const { userId, orgId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // If user already has an organization, redirect to dashboard
  if (orgId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Organization
          </h1>
          <p className="text-gray-600">
            Organizations in Alquemist represent your company or business entity.
            You'll manage facilities, batches, and compliance within your organization.
          </p>
        </div>

        <div className="flex justify-center">
          <CreateOrganization
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg",
                formButtonPrimary:
                  'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              },
            }}
            afterCreateOrganizationUrl="/dashboard"
          />
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 What is an Organization?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• An organization represents your company or agricultural business</li>
            <li>• All your facilities, batches, and data belong to your organization</li>
            <li>• You can invite team members to collaborate within your organization</li>
            <li>• Each organization has its own isolated data (multi-tenant security)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
