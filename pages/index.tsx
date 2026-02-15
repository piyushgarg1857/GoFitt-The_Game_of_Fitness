import Head from 'next/head';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <>
            <Head>
                <title>GoFit - The Game of Fitness</title>
                <meta name="description" content="Turn Fitness Into The Ultimate Game" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="bg-[#0f172a] text-[#f3f4f6] font-['Inter'] overflow-x-hidden min-h-screen">
                {/* Navigation */}
                <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="GoFit Logo" className="w-10 h-10 rounded-full border border-teal-500/30" />
                            <span className="text-xl font-bold font-['Outfit'] tracking-wide text-white">GO<span className="text-teal-400">FIT</span></span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
                            <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Leaderboard</a>
                            <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Community</a>
                        </div>
                        <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-500/30 transition-all font-medium text-sm text-white">
                            Sign In
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center pt-20 overflow-hidden hero-bg">
                    <div className="absolute inset-0 grid-pattern pointer-events-none"></div>

                    {/* Background Blobs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                        {/* Content */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-wider uppercase mb-6">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                Level Up Your Life
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold font-['Outfit'] leading-tight mb-6 text-white">
                                Turn Fitness Into <br />
                                <span className="text-gradient">The Ultimate Game</span>
                            </h1>
                            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Track your workouts, compete with friends, and earn real rewards. GoFit transforms your daily exercise into an immersive RPG experience.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link href="/dashboard" className="btn-gaming">
                                    Start Your Journey
                                </Link>
                                <a href="#" className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-semibold flex items-center gap-2 group text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-teal-400 transition-colors"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    Watch Trailer
                                </a>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-white">50K+</span>
                                    <span className="text-xs uppercase tracking-wide">Active Players</span>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-white">1M+</span>
                                    <span className="text-xs uppercase tracking-wide">Quests Completed</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual / Logo */}
                        <div className="flex justify-center lg:justify-end relative">
                            <div className="relative z-10 animate-float">
                                <div className="logo-container">
                                    {/* Using the provided logo with proper cut (rounded) */}
                                    <img src="/logo.png" alt="GoFit Badge" className="logo-img" />
                                </div>

                                {/* Floating Cards Elements */}
                                <div className="absolute -right-12 top-10 glass-card p-4 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                        🔥
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Streak</div>
                                        <div className="font-bold text-white">14 Days</div>
                                    </div>
                                </div>

                                <div className="absolute -left-12 bottom-10 glass-card p-4 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500">
                                        💪
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Level Up</div>
                                        <div className="font-bold text-white">Level 24</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-[#0B1120]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold font-['Outfit'] mb-4 text-white">Why GoFit?</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">Experience a new way to train. We've combined the addictive mechanics of gaming with the science of fitness.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="glass-card p-8 text-white">
                                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Earn Badges</h3>
                                <p className="text-gray-400 leading-relaxed">Unlock legendary achievements and badges as you hit your fitness milestones. Show off your profile.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="glass-card p-8 text-white">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Compete Together</h3>
                                <p className="text-gray-400 leading-relaxed">Challenge friends to duels, join raid bosses (marathons), and climb the global leaderboards.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="glass-card p-8 text-white">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Real-Time Stats</h3>
                                <p className="text-gray-400 leading-relaxed">Visualize your progress with RPG-style attribute points. Level up your Strength, Stamina, and Agility.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-teal-900/10"></div>
                    <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
                        <h2 className="text-4xl lg:text-5xl font-bold font-['Outfit'] mb-8">Ready to Start Your Quest?</h2>
                        <p className="text-xl text-gray-400 mb-10">Join thousands of players taking back control of their health.</p>
                        <Link href="/dashboard" className="btn-gaming text-lg px-10 py-5">
                            Create Account
                        </Link>
                        <p className="mt-6 text-sm text-gray-500">Free to play • No credit card required</p>
                    </div>
                </section>

                <footer className="py-12 border-t border-white/5 bg-[#0f172a] text-white">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="GoFit" className="w-6 h-6 rounded-full grayscale opacity-50" />
                            <span className="font-bold text-gray-500">GoFit © 2026</span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
