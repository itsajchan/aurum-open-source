"use client";

import { useState, useRef } from "react";
import { X, Plus, Trash2, Loader2, Camera, ImageIcon, Mic, Square, Wand2 } from "lucide-react";

interface BulkItemInput {
  itemName: string;
  quantity: number;
}

interface BulkAddModalProps {
  location: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkAddModal({ location, isOpen, onClose, onSuccess }: BulkAddModalProps) {
  const [items, setItems] = useState<BulkItemInput[]>([
    { itemName: "", quantity: 1 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image capture state
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    setError(null);

    try {
      // Step 1: Transcribe audio with Whisper
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        throw new Error("Transcription failed. Is the faster-whisper server running?");
      }

      const { transcript: text } = await transcribeRes.json();
      setTranscript(text);

      if (!text || text.trim().length === 0) {
        setError("Could not understand the audio. Please try again.");
        return;
      }

      // Step 2: Parse items from transcript
      const parseRes = await fetch("/api/parse-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      if (!parseRes.ok) {
        throw new Error("Failed to parse items");
      }

      const { items: parsedItems } = await parseRes.json();

      if (parsedItems && parsedItems.length > 0) {
        setItems(parsedItems);
      } else {
        setError("Could not identify any items. Please try again or add manually.");
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to process voice input: ${errorMessage}`);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const triggerImageCapture = () => {
    fileInputRef.current?.click();
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      if (file) setError("Please select a valid image file.");
      return;
    }

    setIsProcessingImage(true);
    setError(null);

    try {
      // Create preview for immediate display
      const objectUrl = URL.createObjectURL(file);
      setCapturedImage(objectUrl);

      // Send image to API for parsing
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/parse-items-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      const { items: parsedItems, rawResponse } = data;

      if (parsedItems && parsedItems.length > 0) {
        setItems(parsedItems);
      } else if (rawResponse) {
        setError(`Could not parse items from image. Model response: ${rawResponse.slice(0, 100)}...`);
      } else {
        setError("Could not identify any items in the image. Please try again or add manually.");
      }
    } catch (err) {
      console.error("Image processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to process image: ${errorMessage}`);
    } finally {
      setIsProcessingImage(false);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearCapturedImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addRow = () => {
    setItems([...items, { itemName: "", quantity: 1 }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BulkItemInput, value: string | number) => {
    const updated = [...items];
    if (field === "itemName") {
      updated[index].itemName = value as string;
    } else {
      updated[index].quantity = Math.max(1, Number(value) || 1);
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty items
    const validItems = items.filter(item => item.itemName.trim());
    if (validItems.length === 0) {
      setError("Please add at least one item");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/items/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, items: validItems }),
      });

      if (!res.ok) {
        throw new Error("Failed to add items");
      }

      const data = await res.json();
      console.log(`Added ${data.created} items to ${location}`);
      
      // Reset form and close
      setItems([{ itemName: "", quantity: 1 }]);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to add items. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isProcessingImage && !isProcessingVoice) {
      setItems([{ itemName: "", quantity: 1 }]);
      setError(null);
      setCapturedImage(null);
      setTranscript(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Add items to {location}</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Voice Input Section */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Wand2 size={16} className="text-amber-500" />
                  Voice Input
                </span>
                {isProcessingVoice && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    Processing...
                  </span>
                )}
              </div>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                Describe the items in this location (e.g., &quot;I have 3 boxes of tissues, some hand soap, and a dozen rolls of toilet paper&quot;)
              </p>
              
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isProcessingVoice || isLoading || isProcessingImage}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <Mic size={18} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors animate-pulse"
                  >
                    <Square size={18} />
                    Stop Recording
                  </button>
                )}
              </div>
              
              {transcript && (
                <div className="mt-3 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Transcript:</p>
                  <p className="text-sm">{transcript}</p>
                </div>
              )}
            </div>

            {/* Image Input Section */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon size={16} className="text-amber-500" />
                  Image Input
                </span>
                {isProcessingImage && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    Analyzing...
                  </span>
                )}
              </div>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                Take a photo of items in this location to automatically identify them
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerImageCapture}
                  disabled={isProcessingImage || isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  <Camera size={18} />
                  {isProcessingImage ? "Processing..." : "Take Photo"}
                </button>
              </div>
              
              {capturedImage && (
                <div className="mt-3 space-y-2">
                  <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <img
                      src={capturedImage}
                      alt="Captured items"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearCapturedImage}
                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Clear image
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
              <span className="text-xs text-neutral-400">or add manually</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Column headers */}
            <div className="flex gap-3 text-sm font-medium text-neutral-500 dark:text-neutral-400 px-1">
              <span className="flex-1">Item Name</span>
              <span className="w-20 text-center">Qty</span>
              <span className="w-8"></span>
            </div>

            {/* Item rows */}
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={item.itemName}
                  onChange={(e) => updateItem(index, "itemName", e.target.value)}
                  placeholder="Item name"
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-amber-500 dark:focus:border-amber-500"
                  disabled={isLoading}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  min={1}
                  className="w-20 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 text-center"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={items.length === 1 || isLoading}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {/* Add row button */}
            <button
              type="button"
              onClick={addRow}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Add another item
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Items
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
