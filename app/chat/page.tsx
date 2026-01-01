import { Plus, Camera } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Header activePage="chat" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Aurum!</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            What would you like to find or organize today?
          </p>
        </div>

        {/* Chat Interface */}
        <div className="mb-8">
          <ChatInterface />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors flex flex-col items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="font-medium text-sm">Add Item</span>
          </button>

          <button className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors flex flex-col items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera size={20} />
            </div>
            <span className="font-medium text-sm">Scan Photo</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
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
          <p className="mt-2">Aurum Open Source - AI-Powered Home Inventory</p>
        </div>
      </footer>
    </div>
  );
}
