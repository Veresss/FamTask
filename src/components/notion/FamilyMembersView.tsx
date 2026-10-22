import React from 'react';
import { FamilyMember } from '../../types/notion.ts';
import { Users, ChefHat, Check, X, ShieldAlert } from 'lucide-react';

interface FamilyMembersViewProps {
  members: FamilyMember[];
  onToggleCanCook: (memberId: string) => void;
  onToggleActive: (memberId: string) => void;
  onUpdateNote: (memberId: string, note: string) => void;
}

export const FamilyMembersView: React.FC<FamilyMembersViewProps> = ({
  members,
  onToggleCanCook,
  onToggleActive,
  onUpdateNote,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-7 space-y-6 text-slate-800">
      {/* Title */}
      <div className="border-b border-[#e9e9e7] pb-4">
        <div className="text-3xl mb-1">👨‍👩‍👧‍👦</div>
        <h1 className="text-2xl font-bold font-serif text-slate-900">
          Családtagok (Family Members)
        </h1>
        <p className="text-xs text-slate-500">
          Adatbázis: Family Members / Családtagok • 7 fős család • Főzési jogosultságok kezelése (Életkor sehol nem szerepel!)
        </p>
      </div>

      {/* Notion Callout Box */}
      <div className="p-3.5 bg-[#f7f6f3] border border-[#e8e7e3] rounded-lg text-xs space-y-1">
        <p className="font-bold text-slate-800">📌 Fontos Rendszerszabályok:</p>
        <p className="text-slate-600 leading-relaxed">
          • <strong>Nincsenek életkorok:</strong> Minden családtag teljes mértékben képes a házimunkák elvégzésére.
          <br />• <strong>Főzési jogosultság:</strong> Alapértelmezésben Anyu és Marica tud főzni, de itt bármikor tetszőlegesen be- és kikapcsolható bárkinek. A főzés beosztásnál csak olyan tag választható, akinek a &quot;Tud főzni?&quot; állapota aktív!
        </p>
      </div>

      {/* Table Database View */}
      <div className="overflow-x-auto rounded-lg border border-[#e9e9e7] bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f7f7f5] border-b border-[#e9e9e7] text-slate-600 font-semibold">
              <th className="p-3 border-r border-[#e9e9e7] w-48">Név</th>
              <th className="p-3 border-r border-[#e9e9e7] text-center w-28">Aktív?</th>
              <th className="p-3 border-r border-[#e9e9e7] text-center w-36">Tud főzni?</th>
              <th className="p-3">Megjegyzés / Heti jellemzők</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efefed]">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-[#fafaf9]">
                <td className="p-3 border-r border-[#e9e9e7] font-bold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{member.avatarEmoji || '👤'}</span>
                    <span>{member.name}</span>
                  </div>
                </td>

                <td className="p-3 border-r border-[#e9e9e7] text-center">
                  <button
                    onClick={() => onToggleActive(member.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border ${
                      member.active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    {member.active ? 'Aktív' : 'Inaktív'}
                  </button>
                </td>

                <td className="p-3 border-r border-[#e9e9e7] text-center">
                  <button
                    onClick={() => onToggleCanCook(member.id)}
                    className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors border flex items-center justify-center gap-1.5 mx-auto ${
                      member.canCook
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Kattints a főzési jogosultság módosításához"
                  >
                    <ChefHat className={`w-3.5 h-3.5 ${member.canCook ? 'text-amber-700' : 'text-slate-400'}`} />
                    <span>{member.canCook ? 'Igen' : 'Nem'}</span>
                  </button>
                </td>

                <td className="p-3">
                  <input
                    type="text"
                    value={member.note || ''}
                    onChange={(e) => onUpdateNote(member.id, e.target.value)}
                    placeholder="Megjegyzés rögzítése..."
                    className="w-full text-xs text-slate-700 bg-transparent hover:bg-[#fbfbfa] focus:bg-white px-2 py-1 rounded border border-transparent hover:border-[#e9e9e7] focus:border-indigo-400 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
