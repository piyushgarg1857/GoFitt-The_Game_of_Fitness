import { useState } from 'react';
import Link from 'next/link';
import SEO from '../components/SEO';
import { Send, Mail, MessageCircle, HelpCircle, Loader2, CheckCircle } from 'lucide-react';

const faqs = [
  { q: 'How do I log a run?', a: 'Go to the Dashboard, tap the "+" button and select "Log Activity". You can manually enter distance and duration, or use the Map screen to track in real-time.' },
  { q: 'How does the territory system work?', a: 'When you run through an area, you claim that territory on the map. The more you run in an area, the stronger your claim. Other users can challenge your territories by running the same routes.' },
  { q: 'Why is my leaderboard rank not updating?', a: 'Leaderboard rankings update every few minutes. Make sure your activities are saved correctly. If the issue persists, try logging out and back in.' },
  { q: 'How do I add friends?', a: 'Go to your Profile page and tap the "Find Users" icon in the top right. Search by username and send a friend request.' },
  { q: 'Can I delete my account?', a: 'Yes. Contact us via the form below with your registered email and we will delete your account and all associated data within 7 business days.' },
];

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise(r => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <>
      <SEO title="Support" description="Get help with GoFit. Browse FAQs or contact our support team directly." url="https://gofitt.vercel.app/support" />
      <div className="min-h-screen bg-white font-['Inter'] text-gray-900">
        <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl font-['Outfit']">GoFit</Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold font-['Outfit'] mb-4">How can we help?</h1>
            <p className="text-gray-500 text-lg">Browse FAQs or send us a message — we usually reply within 24 hours.</p>
          </div>

          {/* FAQ */}
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <h2 className="text-2xl font-bold font-['Outfit']">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-4 text-left font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    {faq.q}
                    <span className={`text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/50">
                      <p className="pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <h2 className="text-2xl font-bold font-['Outfit']">Contact Us</h2>
            </div>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <CheckCircle className="w-14 h-14 text-green-500" />
                <h3 className="text-xl font-bold">Message Received!</h3>
                <p className="text-gray-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="support-name" className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                    <input
                      id="support-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="support-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="support-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-900 placeholder-gray-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </section>
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
