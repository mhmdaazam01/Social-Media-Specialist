import { APP_NAME } from '@/lib/constants';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl p-6 md:p-12">
      <h1 className="text-3xl font-bold text-cly-text mb-6">Privacy Policy</h1>
      <div className="prose prose-cly max-w-none text-cly-text-2 space-y-4">
        <p>
          Last updated: {new Date().toLocaleDateString('id-ID')}
        </p>
        <p>
          Welcome to {APP_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
        </p>
        
        <h2 className="text-xl font-semibold text-cly-text mt-8">1. Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. This includes your Google account details used for authentication and data you input for analytics.
        </p>

        <h2 className="text-xl font-semibold text-cly-text mt-8">2. How We Use Your Information</h2>
        <p>
          We use personal information collected via our application for a variety of business purposes, primarily to facilitate account creation, authentication, and to provide the analytics services you request. We do not sell or share your data with third-party AI models without explicit consent.
        </p>

        <h2 className="text-xl font-semibold text-cly-text mt-8">3. Data Security and Right to be Forgotten</h2>
        <p>
          We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. You have the right to request deletion of all your data (factory reset) at any time through the Settings page.
        </p>
      </div>
    </div>
  );
}
