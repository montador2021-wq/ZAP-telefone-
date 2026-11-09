import React from 'react';
import { Plus, Tag, CheckCircle, Edit2, Layers } from 'lucide-react';
import { Category, CustomerLead } from '../types';

interface Props {
  categories: Category[];
  selectedCategoryId: string | null; // null = Todas
  isCompletedView: boolean;
  onSelectCategory: (id: string | null) => void;
  onToggleCompletedView: (showCompleted: boolean) => void;
  onOpenNewCategoryModal: () => void;
  onEditCategory: (category: Category) => void;
  leads: CustomerLead[];
}

export const CategoryBar: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  isCompletedView,
  onSelectCategory,
  onToggleCompletedView,
  onOpenNewCategoryModal,
  onEditCategory,
  leads,
}) => {
  // Count leads per category for waiting/active list
  const activeLeads = leads.filter((l) => l.status !== 'completed' && l.status !== 'cancelled');
  const completedLeads = leads.filter((l) => l.status === 'completed');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Categorias de Produtos</span>
        </div>
        <button
          onClick={onOpenNewCategoryModal}
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Horizontal pill navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
        {/* Todas tab */}
        <button
          onClick={() => {
            onToggleCompletedView(false);
            onSelectCategory(null);
          }}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            !isCompletedView && selectedCategoryId === null
              ? 'bg-slate-100 text-slate-950 shadow-md ring-2 ring-white/20'
              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <span>Todas na Espera</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              !isCompletedView && selectedCategoryId === null
                ? 'bg-slate-950 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {activeLeads.length}
          </span>
        </button>

        {/* Dynamic Category Tabs */}
        {categories.map((cat) => {
          const catActiveCount = activeLeads.filter((l) => l.categoryId === cat.id).length;
          const isSelected = !isCompletedView && selectedCategoryId === cat.id;

          return (
            <div key={cat.id} className="relative group shrink-0">
              <button
                onClick={() => {
                  onToggleCompletedView(false);
                  onSelectCategory(cat.id);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'text-white shadow-lg ring-2 ring-white/30'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border-slate-800/80'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color : undefined,
                  borderColor: isSelected ? cat.color : `${cat.color}35`,
                }}
              >
                {/* Colored dot if not active */}
                {!isSelected && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-black/30 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {catActiveCount}
                </span>
              </button>

              {/* Quick edit button for category */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(cat);
                }}
                title={`Editar categoria ${cat.name}`}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute -top-1 -right-1 p-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-sm cursor-pointer"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}

        {/* Finalizados Tab (Vendas Concluídas) */}
        <button
          onClick={() => {
            onToggleCompletedView(true);
            onSelectCategory(null);
          }}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            isCompletedView
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/30'
              : 'bg-slate-900/90 text-emerald-400/90 hover:bg-emerald-950/40 border-emerald-900/50'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Finalizados</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              isCompletedView
                ? 'bg-emerald-950 text-white'
                : 'bg-emerald-950/80 text-emerald-400'
            }`}
          >
            {completedLeads.length}
          </span>
        </button>
      </div>
    </div>
  );
};
