import Link from 'next/link';
import SEO from '../components/SEO';

export default function PrivacyPage() {
  return (
    <>
      <SEO title="Privacy Policy" description="Read GoFit's privacy policy to understand how we collect, use, and protect your personal data." url="https://gofitt.vercel.app/privacy" />
      <div className="min-h-screen bg-white font-['Inter'] text-gray-900">
        <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl font-['Outfit']">GoFit</Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold font-['Outfit'] mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-12">Last updated: May 14, 2026</p>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly: your username, email address, and password (stored hashed). We also collect fitness data you log including activities, routes, and distances.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>We use your data to provide and improve the GoFit service, power leaderboards and social features, and send relevant notifications. We do not sell your data to third parties.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
              <p>We protect your data using industry-standard encryption. Passwords are hashed using bcrypt. Authentication uses secure HttpOnly cookies to mitigate XSS attacks.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
              <p>GoFit uses HttpOnly session cookies to keep you authenticated. These cannot be accessed by JavaScript and are essential for the service to function.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
              <p>You may request deletion of your account and associated data at any time by contacting us via the Support page.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact</h2>
              <p>For privacy-related questions, please visit our <Link href="/support" className="text-blue-600 hover:underline">Support</Link> page.</p>
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
