import React, { useState } from 'react';
import { PantryItem, ShoppingCategory } from '../../types/notion.ts';
import { SHOPPING_CATEGORIES } from './ShoppingListView.tsx';
import { Package, Plus, CheckCircle2, Circle, AlertTriangle, Trash2 } from 'lucide-react';

interface PantryViewProps {
  pantryItems: PantryItem[];
  onToggleInStock: (id: string) => void;
  onAddItem: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
  onSendLowStockToShopping: (item: PantryItem) => void;
}

export const PantryView: React.FC<PantryViewProps> = ({
  pantryItems,
  onToggleInStock,
  onAddItem,
  onDeleteItem,
  onSendLowStockToShopping,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemMinQty, setNewItemMinQty] = useState('');
  const [newItemCat, setNewItemCat] = useState<ShoppingCategory>('🧂 Egyéb élelmiszer');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      id: `pantry-${Date.now()}`,
      item: newItemName.trim(),
      quantity: newItemQty.trim() || 'elegendő',
      minQuantity: newItemMinQty.trim() || '1 db',
      category: newItemCat,
      inStock: true,
    });

    setNewItemName('');
    setNewItemQty('');
    setNewItemMinQty('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">📦</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Háztartási Készlet (Pantry)
          </h1>
          <p className="text-xs text-slate-500">
            Adatbázis: Pantry / Háztartási készlet • Alapvető tartós élelmiszerek és háztartási cikkek nyilvántartása
          </p>
        </div>
      </div>

      {/* Add New Item */}
      <form onSubmit={handleCreate} className="p-3 bg-white rounded-lg border border-[#e9e9e7] shadow-2xs space-y-2 text-xs">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-600" />
          Új készlet elem rögzítése:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Termék (pl. Liszt, Étolaj, Só)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-4 px-2.5 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="Jelenlegi mennyiség (pl. 2 kg)"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            className="sm:col-span-3 px-2.5 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
          />

          <input
            type="text"
            placeholder="Min. mennyiség (pl. 1 kg)"
            value={newItemMinQty}
            onChange={(e) => setNewItemMinQty(e.target.value)}
            className="sm:col-span-2 px-2.5 py-1.5 border border-[#d8d8d6] rounded-md focus:outline-none"
          />

          <select
            value={newItemCat}
            onChange={(e) => setNewItemCat(e.target.value as ShoppingCategory)}
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
            className="sm:col-span-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-2xs cursor-pointer"
          >
            Mentés
          </button>
        </div>
      </form>

      {/* Pantry Database Table */}
      <div className="overflow-x-auto rounded-lg border border-[#e9e9e7] bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f7f7f5] border-b border-[#e9e9e7] text-slate-600 font-semibold">
              <th className="p-3 border-r border-[#e9e9e7] w-12 text-center">Van?</th>
              <th className="p-3 border-r border-[#e9e9e7]">Termék</th>
              <th className="p-3 border-r border-[#e9e9e7]">Kategória</th>
              <th className="p-3 border-r border-[#e9e9e7]">Mennyiség</th>
              <th className="p-3 border-r border-[#e9e9e7]">Min. készlet</th>
              <th className="p-3 text-right w-28">Művelet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efefed]">
            {pantryItems.map((item) => (
              <tr key={item.id} className="hover:bg-[#fafaf9]">
                <td className="p-3 border-r border-[#e9e9e7] text-center">
                  <button
                    onClick={() => onToggleInStock(item.id)}
                    className="cursor-pointer text-slate-400 hover:text-emerald-600"
                    title={item.inStock ? 'Készleten van' : 'Kifogyott'}
                  >
                    {item.inStock ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </button>
                </td>

                <td className="p-3 border-r border-[#e9e9e7] font-semibold text-slate-900">
                  {item.item}
                </td>

                <td className="p-3 border-r border-[#e9e9e7] text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                    {item.category}
                  </span>
                </td>

                <td className="p-3 border-r border-[#e9e9e7] font-mono text-slate-700">
                  {item.quantity}
                </td>

                <td className="p-3 border-r border-[#e9e9e7] font-mono text-slate-500">
                  {item.minQuantity}
                </td>

                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!item.inStock && (
                      <button
                        onClick={() => onSendLowStockToShopping(item)}
                        className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded hover:bg-amber-100"
                        title="Hozzáadás a bevásárlólistához"
                      >
                        + Lista
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded"
                      title="Törlés"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
