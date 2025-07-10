import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        <div className="font-bold text-xl">Radal Web</div>
        <div className="font-bold text-xl">Radal Web</div>
        <div className="font-bold text-xl">Radal Web</div>
        <div className="flex gap-4">
          <Link href="/sign-in" className="text-sm hover:underline">
            Sign In
          </Link>
          <Link href="/sign-up" className="text-sm hover:underline">
            Sign Up
          </Link>
        </div>
      </header>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-20">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build AI Models Without the Complexity
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Radal Web is a comprehensive platform for creating, training, and
              deploying machine learning models. Upload your datasets, configure
              your models, and get results fast—all through our intuitive
              interface.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/dashboard"
                className="border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Choose Radal Web?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Easy Dataset Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload, organize, and preprocess your datasets with our
                  intuitive drag-and-drop interface.
                </p>
              </div>
              <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Automated Model Training
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure your models with our visual flow editor and let our
                  platform handle the heavy lifting.
                </p>
              </div>
              <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Real-time Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitor your model performance and training progress with
                  comprehensive analytics and visualizations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Project</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start by creating a new project and defining your machine
                  learning objectives.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Data</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload your datasets and let our platform automatically
                  analyze and prepare your data.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Train & Deploy</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Configure your model, start training, and deploy your trained
                  model with just a few clicks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  10K+
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Models Trained
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  500+
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Active Projects
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  50TB+
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Data Processed
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 dark:text-gray-300">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Build Your Next AI Model?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of developers and data scientists who trust Radal
              Web for their machine learning projects.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/dashboard"
                className="border border-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
