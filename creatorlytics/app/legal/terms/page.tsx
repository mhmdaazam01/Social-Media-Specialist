import { APP_NAME } from '@/lib/constants';

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl p-6 md:p-12">
      <h1 className="text-3xl font-bold text-cly-text mb-6">Terms of Service</h1>
      <div className="prose prose-cly max-w-none text-cly-text-2 space-y-4">
        <p>
          Last updated: {new Date().toLocaleDateString('id-ID')}
        </p>
        <p>
          Welcome to {APP_NAME}. These Terms of Service govern your use of our application and services.
        </p>
        
        <h2 className="text-xl font-semibold text-cly-text mt-8">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our application, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>

        <h2 className="text-xl font-semibold text-cly-text mt-8">2. Use of Services</h2>
        <p>
          You must be at least 13 years old to use this service. You are responsible for safeguarding your account information and for all activities that occur under your account. You agree not to use the service for any illegal or unauthorized purpose.
        </p>

        <h2 className="text-xl font-semibold text-cly-text mt-8">3. Intellectual Property</h2>
        <p>
          The service and its original content, features, and functionality are and will remain the exclusive property of {APP_NAME} and its licensors.
        </p>
      </div>
    </div>
  );
}
