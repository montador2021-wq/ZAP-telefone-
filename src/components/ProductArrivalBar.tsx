import React from 'react';
import { Truck, PackageCheck, ArrowRight, MessageSquare, Sparkles, Check } from 'lucide-react';
import { Category, CustomerLead } from '../types';
import { calculateTotalBudget, formatBRL } from '../utils/currency';

interface Props {
  categories: Category[];
  leads: CustomerLead[];
  selectedCategoryId: string | null;
  onSelectCategoryArrival: (categoryId: string) => void;
  onClearArrivalFilter: () => void;
  onQuickBroadcastCategory: (categoryId: string) => void;
}

export const ProductArrivalBar: React.FC<Props> = ({
  categories,
  leads,
  selectedCategoryId,
  onSelectCategoryArrival,
  onClearArrivalFilter,
  onQuickBroadcastCategory,
}) => {
  // Only count leads that are currently waiting
  const waitingLeads = leads.filter((l) => l.status === 'waiting');

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/50 shadow-lg space-y-3">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>Chegou mercadoria hoje?</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1 Toque
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Aperte o que chegou para abrir na hora os clientes que estão esperando:
            </p>
          </div>
        </div>

        {selectedCategoryId && (
          <button
            type="button"
            onClick={onClearArrivalFilter}
            className="text-xs text-slate-400 hover:text-white underline font-semibold self-start sm:self-auto cursor-pointer"
          >
            Limpar filtro / Mostrar todos
          </button>
        )}
      </div>

      {/* Arrival Grid Buttons for each category */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-0.5">
        {categories.map((cat) => {
          const catLeads = waitingLeads.filter((l) => l.categoryId === cat.id);
          const totalBudget = calculateTotalBudget(catLeads);
          const isSelected = selectedCategoryId === cat.id;
          const hasWaiting = catLeads.length > 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategoryArrival(cat.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950'
                  : hasWaiting
                  ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-emerald-600/60'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-black text-white truncate group-hover:text-emerald-300 transition">
                  {cat.name}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${
                    hasWaiting
                      ? isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {catLeads.length}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">
                  {hasWaiting ? (
                    <>
                      <strong className="text-emerald-400 font-semibold">{catLeads.length}</strong>{' '}
                      {catLeads.length === 1 ? 'esperando' : 'esperando'}
                    </>
                  ) : (
                    'Nenhum na espera'
                  )}
                </span>
                {hasWaiting && (
                  <span className="text-[10px] font-mono text-slate-300 block truncate mt-0.5">
                    {formatBRL(totalBudget)}
                  </span>
                )}
              </div>

              {/* Action badge on active */}
              {isSelected && (
                <div className="mt-1.5 pt-1.5 border-t border-emerald-800/60 flex items-center justify-between text-[10px] font-bold text-emerald-300">
                  <span>Filtrado na tela</span>
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
