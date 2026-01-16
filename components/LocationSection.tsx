"use client";

import { useState, useEffect } from "react";
import { Package, MapPin, Hash, Clock, Plus, Trash2, Loader2, MoreVertical, ImageIcon, X, Pencil } from "lucide-react";
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
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [openItemMenu, setOpenItemMenu] = useState<string | null>(null);
  const [locationImage, setLocationImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    // Fetch location image on mount
    const fetchLocationImage = async () => {
      try {
        const res = await fetch(`/api/location-images/${encodeURIComponent(location)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setLocationImage(data.imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch location image:", error);
      }
    };
    fetchLocationImage();
  }, [location]);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    setDeletingItemId(itemId);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        onItemsAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setOpenItemMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editName.trim()) return;
    
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), quantity: editQuantity }),
      });
      if (res.ok) {
        setEditingItem(null);
        onItemsAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!confirm(`Are you sure you want to delete "${location}" and all ${items.length} item(s) in it?`)) return;
    
    setIsDeletingLocation(true);
    try {
      const res = await fetch(`/api/locations/${encodeURIComponent(location)}`, { method: "DELETE" });
      if (res.ok) {
        onItemsAdded(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete location:", error);
    } finally {
      setIsDeletingLocation(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {locationImage ? (
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-amber-500 transition-all"
              title="View location photo"
            >
              <img src={locationImage} alt={location} className="w-full h-full object-cover" />
            </button>
          ) : (
            <MapPin size={20} className="text-amber-500" />
          )}
          <h2 className="text-xl font-semibold">{location}</h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Plus size={16} />
            Add Items
          </button>
          <div className="relative">
            <button
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {locationMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLocationMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      setLocationMenuOpen(false);
                      handleDeleteLocation();
                    }}
                    disabled={isDeletingLocation}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    {isDeletingLocation ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete Location
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenItemMenu(openItemMenu === item.id ? null : item.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {openItemMenu === item.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenItemMenu(null)} />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 min-w-[140px]">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenItemMenu(null);
                          handleDeleteItem(item.id);
                        }}
                        disabled={deletingItemId === item.id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        {deletingItemId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BulkAddModal
        location={location}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          onItemsAdded();
          // Refresh location image
          fetch(`/api/location-images/${encodeURIComponent(location)}`)
            .then(res => res.json())
            .then(data => {
              if (data.imageUrl) setLocationImage(data.imageUrl);
            })
            .catch(() => {});
        }}
      />

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSavingEdit && setEditingItem(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Item</h2>
              <button
                onClick={() => setEditingItem(null)}
                disabled={isSavingEdit}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-amber-500 dark:focus:border-amber-500"
                  disabled={isSavingEdit}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Math.max(1, Number(e.target.value) || 1))}
                  min={1}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-amber-500 dark:focus:border-amber-500"
                  disabled={isSavingEdit}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editName.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && locationImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          />
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-neutral-300 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={locationImage}
              alt={location}
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <p className="text-center text-white mt-2 text-sm">{location}</p>
          </div>
        </div>
      )}
    </section>
  );
}
