"use client";

import { useState } from "react";
import { Package, MapPin, Hash, Clock, Plus } from "lucide-react";
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

interface LocationSectionProps {
  location: string;
  items: Item[];
  onItemsAdded: () => void;
}

export default function LocationSection({ location, items, onItemsAdded }: LocationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-amber-500" />
          <h2 className="text-xl font-semibold">{location}</h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
        >
          <Plus size={16} />
          Add Items
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Package size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  {item.quantity > 1 && (
                    <span className="flex items-center gap-1">
                      <Hash size={12} />
                      {item.quantity}
                    </span>
                  )}
                  {item.usageFrequency && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {item.usageFrequency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BulkAddModal
        location={location}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onItemsAdded}
      />
    </section>
  );
}
