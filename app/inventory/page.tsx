import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import InventoryContent from "@/components/InventoryContent";

// Force dynamic rendering (no static generation)
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  // Fetch items grouped by location
  const items = await prisma.item.findMany({
    orderBy: [
      { location: "asc" },
      { name: "asc" },
    ],
  });

  // Group items by location
  const grouped: Record<string, typeof items> = {};
  
  for (const item of items) {
    const location = item.location || "Uncategorized";
    if (!grouped[location]) {
      grouped[location] = [];
    }
    grouped[location].push(item);
  }

  const locations = Object.keys(grouped).sort((a, b) => {
    // Put "Uncategorized" at the end
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Header activePage="inventory" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <InventoryContent
          items={items}
          grouped={grouped}
          locations={locations}
          totalItems={totalItems}
          totalQuantity={totalQuantity}
        />
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
          </p>
        </div>
      </footer>
    </div>
  );
}
