import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useOutletContext } from "react-router-dom";
import { apiService } from "../../lib/api-client";
import { useAuth } from "../auth/AuthContext";
import { toast } from "sonner";

interface ShellContext {
  openDrawer: (kind: "shipment" | "item" | "user" | "assign" | "status" | "checkpoint", dataId?: string) => void;
}

export const ItemsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { openDrawer } = useOutletContext<ShellContext>();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch Items Query
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: apiService.getItems,
  });

  // Delete Item Mutation
  const deleteMutation = useMutation({
    mutationFn: apiService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted from catalog");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete item");
    }
  });

  // Categories extraction
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  // Filtering logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.itemId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (itemId: string) => {
    if (confirm("Are you sure you want to remove this item from the catalog?")) {
      deleteMutation.mutate(itemId);
    }
  };

  return (
    <div className="page space-y-gutter">
      {/* Head */}
      <div className="page-head flex items-end justify-between mb-6">
        <div>
          <h1 className="font-page-h1 text-page-h1 text-text-primary font-semibold">Catalog Items</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Registered goods catalogued across supply chains.
          </p>
        </div>
        {user?.role === "SUPPLIER" && (
          <button
            onClick={() => openDrawer("item")}
            className="btn btn-primary bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] px-4 py-2 rounded text-button font-button shadow-[0_4px_12px_rgba(255,180,84,0.35)] hover:brightness-105 transition-all"
          >
            + Create Item
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar flex items-center gap-4 flex-wrap mb-4">
        {/* Search */}
        <div className="search-bar max-w-[280px] w-full flex items-center gap-2 bg-[#131519] border border-border-subtle rounded px-3 py-1.5 text-text-tertiary text-[12.5px]">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-text-primary text-[13px] w-full placeholder-text-tertiary"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-[12px] font-medium border transition-all ${
                selectedCategory === cat
                  ? "bg-bg-elevated-2 border-primary text-primary"
                  : "bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="panel bg-[#131519] border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-text-tertiary font-data-mono">
            No inventory catalog items match the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle font-label-eyebrow text-[10px]">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Created At</th>
                  {user?.role === "SUPPLIER" && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {filteredItems.map((item) => (
                  <tr key={item.itemId} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-bg-elevated-2 border border-border-strong flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-[20px]">package_2</span>
                        </div>
                        <div>
                          <Link 
                            to={`/items/${item.itemId}`}
                            className="text-text-primary hover:text-secondary hover:underline text-[13.5px] leading-tight block"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[10px] text-text-tertiary font-data-mono block mt-1">
                            SKU: {item.itemId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-text-secondary">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-[12.5px] text-text-secondary">
                      <div>{item.supplierName}</div>
                      <div className="text-[10.5px] text-text-tertiary font-data-mono mt-0.5">{item.supplierEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-[12.5px] text-text-tertiary font-data-mono">
                      {new Date(item.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    {user?.role === "SUPPLIER" && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDrawer("item", item.itemId)}
                            className="btn btn-ghost border border-border-subtle text-[11px] px-2.5 py-1 rounded hover:text-text-primary transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.itemId)}
                            className="btn btn-danger text-[11px] px-2.5 py-1 rounded bg-status-delayed/10 hover:bg-status-delayed/20 border border-status-delayed/20 text-[#FB6B6B] transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
