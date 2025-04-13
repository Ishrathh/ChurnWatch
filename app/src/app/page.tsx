import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1607944024060-0450380ddd33?auto=format&fit=crop&q=80&w=2000"
            alt="Data analytics dashboard"
            fill
            priority
            className="object-cover brightness-50"
            sizes="100vw"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                <span className="block">Predict Customer Churn</span>
                <span className="block text-blue-400">with ChurnWatch</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                ChurnWatch helps businesses predict and prevent customer churn using advanced machine learning algorithms. Get actionable insights to retain your valuable customers.
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative h-[600px] rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 z-10"></div>
              <Image
                src="https://images.unsplash.com/photo-1607944024060-0450380ddd33?auto=format&fit=crop&q=80&w=1200"
                alt="Data analytics dashboard"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Features = () => {
  {/* Feature Section */ }
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose ChurnWatch?
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {/* Feature 1 */}
            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Advanced Analytics</h3>
                <p className="mt-2 text-base text-gray-500">
                  Leverage powerful machine learning algorithms to predict customer churn with high accuracy.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Real-time Predictions</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get instant predictions and insights to take immediate action on at-risk customers.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Secure & Reliable</h3>
                <p className="mt-2 text-base text-gray-500">
                  Your data is protected with enterprise-grade security and reliable infrastructure.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="ml-16">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Easy Integration</h3>
                <p className="mt-2 text-base text-gray-500">
                  Seamlessly integrate with your existing systems and workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}