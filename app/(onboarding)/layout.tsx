import Image from 'next/image';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="Alquemist"
            width={200}
            height={45}
            priority
            className="mx-auto mb-4"
          />
          <p className="text-sm text-muted-foreground">
            Trazabilidad Agrícola
          </p>
        </div>

        {/* Onboarding Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
