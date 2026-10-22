import React, { useState } from 'react';
import { ShoppingItem, ShoppingCategory, FamilyMember } from '../../types/notion.ts';
import {
  ShoppingCart,
  Plus,
  Check,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Filter,
  Store,
  Layers,
} from 'lucide-react';

interface ShoppingListViewProps {
  shoppingList: ShoppingItem[];
  members: FamilyMember[];
  onTogglePurchased: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onGenerateFromMenu: () => void;
  onToggleInStock: (id: string) => void;
}

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  '🥬 Zöldség',
  '🍎 Gyümölcs',
  '🥩 Hús',
  '🐟 Hal',
  '🥛 Tejtermék',
  '🥚 Tojás',
  '🍞 Pékáru',
  '🍚 Szárazáru',
  '🥫 Konzerv',
  '🧊 Fagyasztott',
  '🧂 Egyéb élelmiszer',
  '🧼 Háztartás',
  '🧴 Tisztítószer',
  '🧻 Papíráru',
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  members,
  onTogglePurchased,
  onAddItem,
  onDeleteItem,
  onGenerateFromMenu,
  onToggleInStock,
}) => {
  const [filterMode, setFilterMode] = useState<'pending' | 'purchased' | 'all'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('db');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingCategory>('🥬 Zöldség');
  const [newItemBuyer, setNewItemBuyer] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      item: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      unit: newItemUnit.trim(),
      category: newItemCategory,
      inStock: false,
      needsBuying: true,
      purchased: false,
      buyerMemberId: newItemBuyer || undefined,
    });

    setNewItemName('');
  };

  const filteredItems = shoppingList.filter((item) => {
    if (filterMode === 'pending' && (!item.needsBuying || item.purchased)) return false;
    if (filterMode === 'purchased' && !item.purchased) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  // Group items by category
  const groupedByCategory = SHOPPING_CATEGORIES.map((cat) => ({
    category: cat,
    items: filteredItems.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const pendingCount = shoppingList.filter((s) => s.needsBuying && !s.purchased).length;
  const purchasedCount = shoppingList.filter((s) => s.purchased).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">🛒</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Heti Bevásárlólista
          </h1>
          <p className="text-xs text-slate-500">
            Adatbázis: Shopping List • 14 kategóriába rendezve • Heti menüből generálható
          </p>
        </div>

        <button
          onClick={onGenerateFromMenu}
          className="px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start cursor-pointer transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Heti menü alapanyagok generálása
        </button>
      </div>

      {/* Add New Item Mini Form */}
      <form onSubmit={handleCreate} className="p-3 bg-white rounded-lg border border-[#e9e9e7] shadow-2xs space-y-2 text-xs">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-600" />
          Új tétel hozzáadása a listához:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Termék neve (pl. Tejföl, Alma, Mosogatószer)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-4 px-2.5 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="Mennyiség (pl. 2)"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            className="sm:col-span-2 px-2.5 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
          />

          <input
            type="text"
            placeholder="Egység (db, kg, l)"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="sm:col-span-2 px-2.5 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
          />

          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as ShoppingCategory)}
            className="sm:col-span-2 px-2 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
          >
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="sm:col-span-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            Hozzáadás
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-[#efefed] p-1 rounded-md border border-[#e2e2e0]">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1 rounded font-semibold cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            Megvásárolandó ({pendingCount})
          </button>
          <button
            onClick={() => setFilterMode('purchased')}
            className={`px-3 py-1 rounded font-semibold cursor-pointer ${
              filterMode === 'purchased'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            Megvásárolva ({purchasedCount})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded font-semibold cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            Összes ({shoppingList.length})
          </button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2 py-1 bg-white border border-[#d8d8d6] rounded-md text-xs font-medium cursor-pointer"
        >
          <option value="all">Minden kategória</option>
          {SHOPPING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped Category Sections */}
      {groupedByCategory.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-[#e9e9e7] text-slate-400 text-xs">
          Nincs megjeleníthető tétel ebben a nézetben.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByCategory.map(({ category, items }) => (
            <div key={category} className="bg-white rounded-lg border border-[#e9e9e7] overflow-hidden shadow-2xs">
              <div className="bg-[#f7f7f5] px-4 py-2 border-b border-[#e9e9e7] flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{category}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {items.length} tétel
                </span>
              </div>

              <div className="divide-y divide-[#efefed]">
                {items.map((item) => {
                  const buyer = members.find((m) => m.id === item.buyerMemberId);

                  return (
                    <div
                      key={item.id}
                      className={`px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
                        item.purchased ? 'bg-slate-50/70 text-slate-400' : 'hover:bg-[#fcfcfa]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => onTogglePurchased(item.id)}
                          className="cursor-pointer text-slate-400 hover:text-emerald-600"
                          title={item.purchased ? 'Visszavonás' : 'Megvásároltnak jelölés'}
                        >
                          {item.purchased ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>

                        <div className="truncate">
                          <span
                            className={`font-semibold ${
                              item.purchased ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.item}
                          </span>
                          {item.store && (
                            <span className="ml-2 text-[10px] text-slate-400 font-medium">
                              ({item.store})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-600 text-[11px]">
                          {item.quantity} {item.unit}
                        </span>

                        {buyer && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium hidden sm:inline">
                            Veszi: {buyer.name}
                          </span>
                        )}

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded"
                          title="Törlés"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
