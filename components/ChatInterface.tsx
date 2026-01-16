"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Package, MapPin, Hash, Clock, ImageIcon, X } from "lucide-react";
import type { ChatResponse, Item } from "@/lib/types/intent";

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; location: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to process request");
      }

      const data: ChatResponse = await res.json();
      setResponse(data);
      
      // Clear input on successful ADD_ITEM
      if (data.intent.intent === "ADD_ITEM" && data.result?.success) {
        setMessage("");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setResponse({
        intent: { intent: "UNKNOWN", data: { message: "Something went wrong. Please try again." } },
        result: { success: false, message: "Something went wrong. Please try again." },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chat Input */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-32 bg-transparent resize-none outline-none text-lg placeholder:text-neutral-400"
              placeholder="Ask about your inventory (e.g., 'Where is the extra toothpaste?') or describe an item to add..."
              disabled={isLoading}
            />
            <div className="absolute bottom-0 right-0 flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Response Display */}
      {response && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Intent Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                response.intent.intent === "ADD_ITEM"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : response.intent.intent === "VIEW_ITEM"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              {response.intent.intent.replace("_", " ")}
            </span>
          </div>

          {/* Result Message */}
          {response.result?.message && (
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">
              {response.result.message}
            </p>
          )}

          {/* Added Item Display */}
          {response.intent.intent === "ADD_ITEM" && response.result?.item && (
            <ItemCard item={response.result.item} onViewImage={setViewingImage} />
          )}

          {/* Found Items Display */}
          {response.intent.intent === "VIEW_ITEM" && response.result?.items && response.result.items.length > 0 && (
            <div className="space-y-3">
              {response.result.items.map((item) => (
                <ItemCard key={item.id} item={item} onViewImage={setViewingImage} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewingImage(null)}
          />
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-neutral-300 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={viewingImage.url}
              alt={viewingImage.location}
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <p className="text-center text-white mt-2 text-sm">{viewingImage.location}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onViewImage }: { item: Item; onViewImage: (img: { url: string; location: string }) => void }) {
  const [locationImage, setLocationImage] = useState<string | null>(null);

  useEffect(() => {
    if (item.location) {
      fetch(`/api/location-images/${encodeURIComponent(item.location)}`)
        .then(res => res.json())
        .then(data => {
          if (data.imageUrl) {
            setLocationImage(data.imageUrl);
          }
        })
        .catch(() => {});
    }
  }, [item.location]);

  return (
    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
          <Package size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {item.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-neutral-500 dark:text-neutral-500">
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {item.location}
                {locationImage && (
                  <button
                    onClick={() => onViewImage({ url: locationImage, location: item.location! })}
                    className="ml-1 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    title="View location photo"
                  >
                    <ImageIcon size={14} className="text-amber-500" />
                  </button>
                )}
              </span>
            )}
            {item.quantity > 1 && (
              <span className="flex items-center gap-1">
                <Hash size={14} />
                {item.quantity}
              </span>
            )}
            {item.usageFrequency && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {item.usageFrequency}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
