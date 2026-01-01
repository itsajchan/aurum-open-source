import { Package, MessageSquare, Mic, Camera, Search, MapPin, Shield, Zap, Github, ArrowRight } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Header activePage="home" />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
            <Shield size={16} />
            100% Local & Private
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            AI-Powered Home Inventory
            <span className="text-amber-500"> That Respects Your Privacy</span>
          </h1>
          
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Track, organize, and find your belongings using natural language, voice, or photos. 
            All AI processing happens locally on your machine—your data never leaves home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <a
              href="https://github.com/itsajchan/aurum-open-source"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Github size={20} />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to Stay Organized
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Aurum combines the power of local AI with an intuitive interface to make home inventory management effortless.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Language Chat</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Just describe what you&apos;re looking for or what you want to add. &quot;Where did I put the extra batteries?&quot;
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Mic size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Input</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Speak to add items hands-free. Perfect for when you&apos;re organizing a closet or unpacking boxes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Image Recognition</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Take a photo of items and let AI identify them automatically. Bulk add items in seconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Semantic Search</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Find items even with fuzzy descriptions. Search for &quot;cleaning supplies&quot; and find your mop, broom, and detergent.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based Organization</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Organize items by room, drawer, or container. Know exactly where everything is stored.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Modern</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Built with Next.js 16 and Turbopack for blazing fast performance. Beautiful, responsive UI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by Open Source
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">
            Built with best-in-class open source technologies. Run everything locally with no cloud dependencies.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              Next.js 16
            </div>
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              Ollama
            </div>
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              PostgreSQL + pgvector
            </div>
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              faster-whisper
            </div>
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              Qwen VL
            </div>
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              TailwindCSS
            </div>
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium">
              Prisma
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-amber-500 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-amber-100 mb-8 max-w-xl mx-auto">
            Start tracking your home inventory today. It&apos;s free, open source, and runs entirely on your machine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-amber-600 font-semibold hover:bg-amber-50 transition-colors"
            >
              Start Using Aurum
              <ArrowRight size={20} />
            </Link>
            <a
              href="https://github.com/itsajchan/aurum-open-source"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white font-semibold hover:bg-amber-600 transition-colors"
            >
              <Github size={20} />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white">
              <Package size={14} />
            </div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Aurum Open Source</span>
          </div>
          <p>
            Built with ❤️ by{" "}
            <a
              href="https://twitter.com/itsajchan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              Adam Chan
            </a>
            {" "}•{" "}
            <a
              href="https://linkedin.com/in/itsajchan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              LinkedIn
            </a>
            {" "}•{" "}
            <a
              href="https://github.com/itsajchan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              GitHub
            </a>
          </p>
          <p className="mt-2">MIT License © 2026</p>
        </div>
      </footer>
    </div>
  );
}
