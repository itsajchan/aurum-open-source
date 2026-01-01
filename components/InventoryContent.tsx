"use client";

import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import LocationSection from "./LocationSection";
import { useState } from "react";
import BulkAddModal from "./BulkAddModal";

interface Item {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  quantity: number;
  usageFrequency: string | null;
  image: string | null;
}

interface InventoryContentProps {
  items: Item[];
  grouped: Record<string, Item[]>;
  locations: string[];
  totalItems: number;
  totalQuantity: number;
}

export default function InventoryContent({ 
  items, 
  grouped, 
  locations, 
  totalItems, 
  totalQuantity 
}: InventoryContentProps) {
  const router = useRouter();
  const [isNewLocationModalOpen, setIsNewLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");

  const handleItemsAdded = () => {
    // Refresh the page to show new items
    router.refresh();
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Inventory</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {totalItems} item{totalItems !== 1 ? "s" : ""} • {totalQuantity} total quantity • {locations.length} location{locations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setIsNewLocationModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
        >
          <Plus size={18} />
          New Location
        </button>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No items yet</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Start adding items to your inventory using the chat interface or create a new location.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            Go to Chat
          </a>
        </div>
      )}

      {/* Grouped Items */}
      <div className="space-y-8">
        {locations.map((location) => (
          <LocationSection
            key={location}
            location={location}
            items={grouped[location]}
            onItemsAdded={handleItemsAdded}
          />
        ))}
      </div>

      {/* New Location Modal */}
      {isNewLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsNewLocationModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Location</h2>
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Location name (e.g., Kitchen Cabinet)"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsNewLocationModalOpen(false);
                  setNewLocationName("");
                }}
                className="px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newLocationName.trim()) {
                    setIsNewLocationModalOpen(false);
                  }
                }}
                disabled={!newLocationName.trim()}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                Create & Add Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Modal for new location */}
      {newLocationName.trim() && !isNewLocationModalOpen && (
        <BulkAddModal
          location={newLocationName.trim()}
          isOpen={true}
          onClose={() => setNewLocationName("")}
          onSuccess={() => {
            setNewLocationName("");
            handleItemsAdded();
          }}
        />
      )}
    </>
  );
}
