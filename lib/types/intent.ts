// Intent types for the inventory chat system

export type IntentType = "ADD_ITEM" | "VIEW_ITEM" | "UNKNOWN";

export interface AddItemIntent {
  intent: "ADD_ITEM";
  data: {
    name: string;
    description?: string;
    location?: string;
    quantity?: number;
    usageFrequency?: string;
  };
}

export interface ViewItemIntent {
  intent: "VIEW_ITEM";
  data: {
    itemIds: string[]; // Array of item IDs to view
  };
}

export interface UnknownIntent {
  intent: "UNKNOWN";
  data: {
    message: string; // Helpful message to guide the user
  };
}

export type IntentResponse = AddItemIntent | ViewItemIntent | UnknownIntent;

// Item type matching Prisma schema
export interface Item {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  quantity: number;
  usageFrequency: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ChatResponse {
  intent: IntentResponse;
  result?: {
    success: boolean;
    item?: Item;
    items?: Item[];
    message?: string;
  };
}
