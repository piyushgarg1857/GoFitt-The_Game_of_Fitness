import Link from 'next/link';
import SEO from '../components/SEO';

export default function TermsPage() {
  return (
    <>
      <SEO title="Terms of Service" description="Read GoFit's Terms of Service — the rules and guidelines for using our fitness platform." url="https://gofitt.vercel.app/terms" />
      <div className="min-h-screen bg-white font-['Inter'] text-gray-900">
        <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl font-['Outfit']">GoFit</Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold font-['Outfit'] mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-12">Last updated: May 14, 2026</p>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using GoFit, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not use our service.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account. You must be at least 13 years of age to use this service. You agree to provide accurate information during registration.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Acceptable Use</h2>
              <p>You agree not to use GoFit to post harmful, abusive, or illegal content. You may not attempt to reverse-engineer, hack, or disrupt our services. Users who violate these terms may be banned.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Fitness Disclaimer</h2>
              <p>GoFit provides fitness tracking tools for informational purposes only. Consult a medical professional before starting any new fitness program. We are not responsible for injuries sustained during physical activity.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
              <p>GoFit is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
              <p>Questions about these terms? Visit our <Link href="/support" className="text-blue-600 hover:underline">Support</Link> page.</p>
            </section>
          </div>
        </main>
        <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-gray-700 transition-colors">Support</Link>
          </div>
          <p className="mt-4">GoFit © 2026</p>
        </footer>
      </div>
    </>
  );
}
