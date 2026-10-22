import React, { useState, useEffect } from 'react';
import { ChoreDefinition, ChoreFrequency } from '../../types/notion.ts';
import { X, Check, Clock, Home, RotateCcw, AlertCircle } from 'lucide-react';

interface ChoreDefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choreDef: ChoreDefinition) => void;
  initialChoreDef?: ChoreDefinition | null;
}

const ROOM_AREAS = [
  'Konyha',
  'Fürdő',
  'Mosás',
  'Szobák',
  'Közös terek',
  'Kültér',
  'Háztartás',
];

const FREQUENCIES: Array<{ value: ChoreFrequency; label: string; desc: string }> = [
  { value: 'napi', label: 'Napi (7 naponta)', desc: 'Minden nap kiosztásra kerül' },
  { value: 'heti', label: 'Heti (hetente egyszer)', desc: 'Heti igazságos beosztás része' },
  { value: 'havi', label: 'Havi', desc: 'Havonta egyszer esedékes teendő' },
  { value: '2-3 havi', label: '2-3 havi', desc: 'Rendszeres időszaki nagytakarítás' },
  { value: 'szezonális', label: 'Szezonális', desc: 'Idényjellegű nagytakarítási feladat' },
];

export const ChoreDefModal: React.FC<ChoreDefModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChoreDef,
}) => {
  const [title, setTitle] = useState('');
  const [roomArea, setRoomArea] = useState('Konyha');
  const [customRoom, setCustomRoom] = useState('');
  const [frequency, setFrequency] = useState<ChoreFrequency>('heti');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [isRecurring, setIsRecurring] = useState(true);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialChoreDef) {
      setTitle(initialChoreDef.title);
      if (ROOM_AREAS.includes(initialChoreDef.roomArea)) {
        setRoomArea(initialChoreDef.roomArea);
        setCustomRoom('');
      } else {
        setRoomArea('Egyéb');
        setCustomRoom(initialChoreDef.roomArea);
      }
      setFrequency(initialChoreDef.frequency);
      setEstimatedMinutes(initialChoreDef.estimatedMinutes);
      setIsActive(initialChoreDef.isActive);
      setIsRecurring(initialChoreDef.isRecurring);
      setNote(initialChoreDef.note || '');
    } else {
      setTitle('');
      setRoomArea('Konyha');
      setCustomRoom('');
      setFrequency('heti');
      setEstimatedMinutes(15);
      setIsActive(true);
      setIsRecurring(true);
      setNote('');
    }
    setError(null);
  }, [initialChoreDef, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Kérlek add meg a feladat megnevezését!');
      return;
    }

    const finalRoom = roomArea === 'Egyéb' ? customRoom.trim() || 'Közös terek' : roomArea;

    const choreDef: ChoreDefinition = {
      id: initialChoreDef ? initialChoreDef.id : `chore-custom-${Date.now()}`,
      title: title.trim(),
      roomArea: finalRoom,
      frequency,
      estimatedMinutes: Math.max(5, estimatedMinutes),
      isActive,
      isRecurring,
      note: note.trim() || undefined,
    };

    onSave(choreDef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-2xs">
              🧹
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialChoreDef ? 'Feladat Szerkesztése' : 'Új Feladat Létrehozása'}
              </h3>
              <p className="text-[11px] text-slate-300">
                A feladat bekerül a családi házimunka-katalógusba
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Feladat megnevezése *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. Nappali felporszívózása, Kávéfőző vízkőtelenítése..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Helyiség / Terület *
              </label>
              <select
                value={roomArea}
                onChange={(e) => setRoomArea(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {ROOM_AREAS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Egyéb">Egyéb (egyéni)...</option>
              </select>

              {roomArea === 'Egyéb' && (
                <input
                  type="text"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  placeholder="Helyiség megnevezése"
                  className="mt-1.5 w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gyakoriság *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ChoreFrequency)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Becsült időtartam: <span className="text-indigo-600 font-bold">{estimatedMinutes} perc</span>
              </label>
              <span className="text-[10px] text-slate-400">5 – 180 perc</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 15)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5 perc</span>
              <span>30 perc</span>
              <span>60 perc</span>
              <span>120 perc</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Megjegyzés / Részletek (opcionális)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="pl. zsíroldóval áttörölni, a mikroszálas kendőt használni..."
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Status Switches */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <div>
                <span className="font-bold text-slate-900 block">Aktív feladat</span>
                <span className="text-[10px] text-slate-500">
                  Ha be van pipálva, az algoritmus bevonja az automatikus igazságos szétosztásba.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <div>
                <span className="font-bold text-slate-900 block">Ismétlődő feladat</span>
                <span className="text-[10px] text-slate-500">
                  Rendszeresen visszatérő családi teendő.
                </span>
              </div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs hover:shadow cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialChoreDef ? 'Mentés' : 'Feladat Hozzáadása'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

