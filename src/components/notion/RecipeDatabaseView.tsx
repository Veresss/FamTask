import React, { useState } from 'react';
import { Recipe, RecipeCategory } from '../../types/notion.ts';
import {
  BookOpen,
  Clock,
  Users,
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  X,
  Star,
  Plus,
} from 'lucide-react';

interface RecipeDatabaseViewProps {
  recipes: Recipe[];
  onAddRecipeIngredientsToShopping: (recipe: Recipe) => void;
  selectedModalRecipe: Recipe | null;
  onSelectModalRecipe: (recipe: Recipe | null) => void;
}

export const RecipeDatabaseView: React.FC<RecipeDatabaseViewProps> = ({
  recipes,
  onAddRecipeIngredientsToShopping,
  selectedModalRecipe,
  onSelectModalRecipe,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLunchFriendly, setFilterLunchFriendly] = useState(false);
  const [filterNightBefore, setFilterNightBefore] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories: RecipeCategory[] = [
    'csirkés',
    'húsos',
    'halas',
    'vegetáriánus',
    'tésztás',
    'rizses',
    'saláta',
    'leves',
    'egytálétel',
    'gyors vacsora',
    'elviteles ebéd',
    'maradékmentő',
  ];

  const filteredRecipes = recipes.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (filterLunchFriendly && !r.isLunchFriendly) return false;
    if (filterNightBefore && !r.prepNightBefore) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchIngr = r.ingredients.some((i) => i.item.toLowerCase().includes(q));
      if (!matchName && !matchIngr) return false;
    }
    return true;
  });

  const handleAddShopping = (recipe: Recipe) => {
    onAddRecipeIngredientsToShopping(recipe);
    setAddedToast(`"${recipe.name}" alapanyagai hozzáadva a bevásárlólistához!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl mb-1">📖</div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            Receptek Gyűjteménye ({recipes.length} recept)
          </h1>
          <p className="text-xs text-slate-500">
            Adatbázis: Recipes / Receptek • Gyors (15–45 perc), egészséges, jól szállítható családbarát ételek
          </p>
        </div>

        {addedToast && (
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{addedToast}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white rounded-lg border border-[#e9e9e7] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Keresés étel vagy alapanyag szerint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1 bg-[#f7f7f5] border border-[#e2e2e0] rounded-md font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Minden kategória ({recipes.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterLunchFriendly(!filterLunchFriendly)}
            className={`px-2 py-1 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
              filterLunchFriendly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-[#f7f7f5] text-slate-600 border-[#e2e2e0] hover:bg-slate-100'
            }`}
          >
            🍱 Elviteles ebédre alkalmas
          </button>

          <button
            onClick={() => setFilterNightBefore(!filterNightBefore)}
            className={`px-2 py-1 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
              filterNightBefore
                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                : 'bg-[#f7f7f5] text-slate-600 border-[#e2e2e0] hover:bg-slate-100'
            }`}
          >
            🌙 Előző este elkészíthető
          </button>
        </div>
      </div>

      {/* Recipes Notion Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => onSelectModalRecipe(recipe)}
            className="group rounded-xl border border-[#e9e9e7] bg-white hover:border-slate-400 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-[#f7f7f5] px-2 py-0.5 rounded">
                  {recipe.category}
                </span>

                <span className="text-[11px] font-mono font-medium text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {recipe.prepTimeMinutes} perc
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {recipe.name}
              </h3>

              <div className="flex flex-wrap gap-1 text-[10px]">
                {recipe.isLunchFriendly && (
                  <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                    🍱 Elviteles ebéd
                  </span>
                )}
                {recipe.prepNightBefore && (
                  <span className="bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded border border-indigo-200">
                    🌙 Előző este készíthető
                  </span>
                )}
                {recipe.portable && (
                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                    📦 Jól szállítható
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 leading-relaxed">
                {recipe.ingredients.map((i) => i.item).join(', ')}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-[#f1f1ef] flex items-center justify-between text-xs text-slate-500">
              <span>{recipe.portions} adag</span>
              <span className="text-indigo-600 group-hover:underline font-medium text-[11px]">
                Recept & Hozzávalók ➔
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedModalRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#e9e9e7] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e9e9e7] bg-[#fbfbfa] flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                  {selectedModalRecipe.category}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedModalRecipe.name}
                </h2>
                <p className="text-xs text-slate-500">
                  ⏱️ {selectedModalRecipe.prepTimeMinutes} perc • {selectedModalRecipe.portions} adag
                </p>
              </div>

              <button
                onClick={() => onSelectModalRecipe(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                aria-label="Bezárás"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Properties Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">
                  Nehézség: <strong>{selectedModalRecipe.difficulty}</strong>
                </span>
                <span className={`px-2 py-1 rounded ${selectedModalRecipe.isLunchFriendly ? 'bg-amber-100 text-amber-800 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  🍱 Elviteles ebédre: {selectedModalRecipe.isLunchFriendly ? 'Igen' : 'Nem'}
                </span>
                <span className={`px-2 py-1 rounded ${selectedModalRecipe.prepNightBefore ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  🌙 Előző este készíthető: {selectedModalRecipe.prepNightBefore ? 'Igen' : 'Nem'}
                </span>
                <span className={`px-2 py-1 rounded ${selectedModalRecipe.portable ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  📦 Szállítható: {selectedModalRecipe.portable ? 'Igen' : 'Nem'}
                </span>
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Hozzávalók ({selectedModalRecipe.portions} adaghoz):
                  </h4>
                  <button
                    onClick={() => handleAddShopping(selectedModalRecipe)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Hozzávalók küldése bevásárlólistára
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-[#e9e9e7] rounded-lg overflow-hidden bg-[#fbfbfa]">
                  {selectedModalRecipe.ingredients.map((ingr, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{ingr.item}</span>
                      <span className="font-mono text-slate-500">{ingr.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Elkészítés:
                </h4>
                <div className="p-3.5 bg-[#fbfbfa] border border-[#e9e9e7] rounded-lg leading-relaxed text-slate-700">
                  {selectedModalRecipe.instructions}
                </div>
              </div>

              {/* Note */}
              {selectedModalRecipe.note && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                  💡 <strong>Tipp:</strong> {selectedModalRecipe.note}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#f7f7f5] border-t border-[#e9e9e7] flex items-center justify-end">
              <button
                onClick={() => onSelectModalRecipe(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md text-xs"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
