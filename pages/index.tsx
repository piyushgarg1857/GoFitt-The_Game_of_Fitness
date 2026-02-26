import Head from 'next/head';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <>
            <Head>
                <title>GoFit - Professional Fitness Experience</title>
                <meta name="description" content="Elevate your fitness journey with GoFit." />
            </Head>

            <div className="bg-white text-gray-900 font-['Inter'] overflow-x-hidden min-h-screen">
                {/* Navigation */}
                <nav className="fixed w-full z-50 top-0 left-0 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="GoFit" className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                            <span className="text-xl font-bold font-['Outfit'] tracking-wide text-gray-900">GoFit</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
                            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Leaderboard</a>
                            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Community</a>
                        </div>
                        <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all font-medium text-sm">
                            Dashboard
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase mb-6">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Elevate Your Performance
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold font-['Outfit'] leading-tight mb-6 text-gray-900 tracking-tight">
                                Smarter Fitness <br />
                                <span className="text-gray-400">Superior Results</span>
                            </h1>
                            <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Track your athletic progress, connect with peers, and reach milestones. GoFit provides a refined tracking ecosystem for dedicated individuals.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link href="/dashboard" className="px-8 py-4 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all text-lg shadow-sm">
                                    Start Exploring
                                </Link>
                                <a href="#" className="px-8 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 text-gray-700 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    View Platform
                                </a>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-900">50K+</span>
                                    <span className="text-xs uppercase tracking-wide">Active Members</span>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-900">1M+</span>
                                    <span className="text-xs uppercase tracking-wide">Activities Logged</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end relative">
                            <div className="relative z-10">
                                <img src="/logo.png" alt="GoFit Core" className="w-96 rounded-3xl shadow-xl border border-gray-100 object-cover" />

                                <div className="absolute -right-8 top-10 bg-white border border-gray-100 shadow-lg p-4 rounded-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                        📈
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Streak</div>
                                        <div className="font-bold text-gray-900">14 Days</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold font-['Outfit'] mb-4 text-gray-900">Why GoFit?</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">Modern design paired with precise tracking tools to shape your fitness routine.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 mb-6 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Milestones</h3>
                                <p className="text-gray-500 leading-relaxed">Log your sessions consistently and reach systematic milestones that define your athletic journey.</p>
                            </div>

                            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 mb-6 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
                                <p className="text-gray-500 leading-relaxed">Connect with peers, claim mapping territories, and maintain a highly structured workout network.</p>
                            </div>

                            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-800 mb-6 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics</h3>
                                <p className="text-gray-500 leading-relaxed">Visualize clear, unhindered data with comprehensive metrics that reflect your stamina and dedication.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-900 text-white text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-4xl lg:text-5xl font-bold font-['Outfit'] mb-6 tracking-tight">Ready to Begin?</h2>
                        <p className="text-xl text-gray-400 mb-10">Access the definitive activity terminal today.</p>
                        <Link href="/dashboard" className="px-10 py-5 rounded-xl font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-all text-lg shadow-lg">
                            Establish Account
                        </Link>
                    </div>
                </section>

                <footer className="py-10 border-t border-gray-100 bg-white text-gray-900">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="GoFit" className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-bold text-gray-500">GoFit © 2026</span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
