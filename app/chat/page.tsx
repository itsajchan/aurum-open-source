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
