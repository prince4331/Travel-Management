// Landing Page - Home page before login
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading or nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌍</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, don't show landing page (redirecting)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🌍</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                TravelSync
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition">How It Works</a>
              <a href="#offline" className="text-gray-600 hover:text-blue-600 font-medium transition">Offline Mode</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">✈️</div>
          <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float-delayed">🏔️</div>
          <div className="absolute bottom-40 left-1/4 text-4xl opacity-20 animate-float">🌴</div>
          <div className="absolute top-60 right-1/3 text-5xl opacity-20 animate-float-delayed">🏖️</div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Travel Together,
              </span>
              <br />
              <span className="text-gray-800">Manage Effortlessly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate travel companion for groups. Track expenses, share moments, 
              stay connected - even without internet!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white text-lg font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition flex items-center gap-2"
              >
                <span>Start Your Adventure</span>
                <span>🚀</span>
              </Link>
              <a 
                href="#how-it-works"
                className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition"
              >
                See How It Works
              </a>
            </div>

            {/* Hero Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition">
                <div className="text-4xl mb-3">💰</div>
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-gray-600">Automatic Expense Split</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition">
                <div className="text-4xl mb-3">🔗</div>
                <div className="text-3xl font-bold text-purple-600">Offline</div>
                <div className="text-gray-600">Works Without Internet</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition">
                <div className="text-4xl mb-3">🌍</div>
                <div className="text-3xl font-bold text-green-600">Remote</div>
                <div className="text-gray-600">Mesh Network Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Everything You Need for Group Travel
            </h2>
            <p className="text-xl text-gray-600">
              From mountains to beaches, we&apos;ve got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <FeatureCard 
              emoji="💸"
              title="Smart Expense Tracking"
              description="Split bills instantly, track who paid what, and settle up with ease. Multi-currency support included!"
              features={["Auto-calculate splits", "Receipt scanning", "Export to CSV/PDF", "Settlement tracking"]}
              gradient="from-blue-50 to-blue-100"
            />
            
            <FeatureCard 
              emoji="🗺️"
              title="Offline Maps"
              description="Download maps before you go. Navigate even in remote areas with zero signal."
              features={["OpenStreetMap integration", "Auto-cache tiles", "Custom markers", "Route planning"]}
              gradient="from-purple-50 to-purple-100"
            />
            
            <FeatureCard 
              emoji="🔗"
              title="Mesh Network Chat"
              description="Stay connected via Bluetooth even without internet. Perfect for mountains and deserts!"
              features={["Peer-to-peer messaging", "Expense sync via Bluetooth", "Multi-hop routing", "100m+ range per hop"]}
              gradient="from-green-50 to-green-100"
            />
            
            <FeatureCard 
              emoji="👥"
              title="Group Management"
              description="Create groups, invite friends, assign roles. QR code invites make joining effortless."
              features={["Role-based access", "QR code invites", "Emergency contacts", "Member profiles"]}
              gradient="from-orange-50 to-orange-100"
            />
            
            <FeatureCard 
              emoji="📄"
              title="Document Storage"
              description="Store passports, tickets, IDs securely. Share with time limits and track access."
              features={["Encrypted storage", "Shareable links", "Access logs", "Auto-expiry"]}
              gradient="from-pink-50 to-pink-100"
            />
            
            <FeatureCard 
              emoji="🎯"
              title="Tour Types"
              description="Choose between friendly tours (full transparency) or paid tours (admin-only finances)."
              features={["Friendly tours", "Paid tours", "Custom privacy", "Flexible settings"]}
              gradient="from-yellow-50 to-yellow-100"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Simple as 1-2-3
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number={1}
              title="Create Your Trip"
              description="Sign up, create a group, and invite your travel buddies with a simple QR code or link."
              color="from-blue-500 to-blue-600"
            />
            <StepCard 
              number={2}
              title="Track Expenses"
              description="Add expenses as you go. We'll automatically calculate who owes what. Works offline!"
              color="from-purple-500 to-purple-600"
            />
            <StepCard 
              number={3}
              title="Settle Up"
              description="When the trip ends, see who owes whom and settle up easily. Export reports for records."
              color="from-green-500 to-green-600"
            />
          </div>
        </div>
      </section>

      {/* Offline Mode Highlight */}
      <section id="offline" className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🏔️</div>
          <div className="absolute bottom-10 right-10 text-9xl">🏜️</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Works Everywhere. Even Without Internet.
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Going to remote mountains? Desert safari? Deep jungle trek? 
              No problem! Our offline-first architecture keeps you connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">📵</div>
              <h3 className="text-2xl font-bold mb-3">Complete Offline Mode</h3>
              <p className="opacity-90 mb-4">
                All features work without internet: expenses, maps, chat, documents. 
                Data syncs automatically when you&apos;re back online.
              </p>
              <ul className="space-y-2 opacity-90">
                <li>✓ IndexedDB storage</li>
                <li>✓ Service Worker caching</li>
                <li>✓ Background sync</li>
                <li>✓ Auto 24h refresh</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-3">Bluetooth Mesh Network</h3>
              <p className="opacity-90 mb-4">
                Connect with nearby travelers using Bluetooth. Chat and sync expenses 
                peer-to-peer without any internet!
              </p>
              <ul className="space-y-2 opacity-90">
                <li>✓ P2P messaging</li>
                <li>✓ Expense broadcasting</li>
                <li>✓ Multi-hop routing</li>
                <li>✓ 100m+ range</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/mesh-network"
              className="inline-block px-8 py-4 bg-white text-purple-600 text-lg font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition"
            >
              Try Mesh Network Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              name="Free"
              price="$0"
              period="/month"
              features={[
                "Up to 3 active groups",
                "Unlimited expenses",
                "Offline mode",
                "Basic maps",
                "Mesh network"
              ]}
              buttonText="Get Started"
              buttonLink="/signup"
            />
            
            <PricingCard 
              name="Pro"
              price="$9"
              period="/month"
              featured={true}
              features={[
                "Unlimited groups",
                "Advanced analytics",
                "Priority support",
                "Custom branding",
                "API access"
              ]}
              buttonText="Start Pro Trial"
              buttonLink="/signup"
            />
            
            <PricingCard 
              name="Enterprise"
              price="Custom"
              period=""
              features={[
                "Everything in Pro",
                "Dedicated support",
                "Custom integrations",
                "SLA guarantee",
                "On-premise option"
              ]}
              buttonText="Contact Sales"
              buttonLink="mailto:contact@travelsync.com"
              isContact={true}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who manage their trips stress-free with TravelSync
          </p>
          <Link 
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-green-600 text-xl font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition"
          >
            Start Free Today 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🌍</span>
                <span className="text-xl font-bold">TravelSync</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making group travel simple, transparent, and connected.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/mesh-network" className="hover:text-white transition">Mesh Network</Link></li>
                <li><a href="#" className="hover:text-white transition">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 TravelSync. All rights reserved. Made with ❤️ for travelers.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Helper Components
function FeatureCard({ emoji, title, description, features, gradient }: any) {
  return (
    <div className={`group bg-gradient-to-br ${gradient} rounded-2xl p-8 hover:shadow-2xl transform hover:-translate-y-2 transition`}>
      <div className="text-5xl mb-4 group-hover:scale-110 transition">{emoji}</div>
      <h3 className="text-2xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2 text-sm text-gray-700">
        {features.map((feature: string, i: number) => (
          <li key={i}>✓ {feature}</li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ number, title, description, color }: any) {
  return (
    <div className="text-center">
      <div className={`w-20 h-20 bg-gradient-to-r ${color} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg`}>
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, features, buttonText, buttonLink, featured, isContact }: any) {
  if (featured) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white transform scale-105 shadow-2xl">
        <div className="bg-yellow-400 text-gray-800 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
          MOST POPULAR
        </div>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="text-4xl font-bold mb-6">
          {price}<span className="text-lg opacity-75">{period}</span>
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-yellow-300">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link 
          href={buttonLink}
          className="block w-full text-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:shadow-lg transition"
        >
          {buttonText}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl transition">
      <h3 className="text-2xl font-bold mb-2 text-gray-800">{name}</h3>
      <div className="text-4xl font-bold mb-6 text-gray-800">
        {price}<span className="text-lg text-gray-500">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {isContact ? (
        <a 
          href={buttonLink}
          className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          {buttonText}
        </a>
      ) : (
        <Link 
          href={buttonLink}
          className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
