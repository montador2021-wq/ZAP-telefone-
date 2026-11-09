import React from 'react';
import { Clock, AlertCircle, CheckCircle2, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { CustomerLead } from '../types';
import { calculateTotalBudget, formatBRL } from '../utils/currency';

interface Props {
  leads: CustomerLead[];
  onFilterToday: () => void;
  isTodayFiltered: boolean;
  selectedCategoryName?: string;
  isCompletedView?: boolean;
}

export const StatsBar: React.FC<Props> = ({
  leads,
  onFilterToday,
  isTodayFiltered,
  selectedCategoryName,
  isCompletedView,
}) => {
  const waitingLeads = leads.filter((l) => l.status === 'waiting');
  const completedLeads = leads.filter((l) => l.status === 'completed');

  // Leads with return date today or overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayOrOverdue = waitingLeads.filter((l) => {
    if (!l.returnDate) return false;
    return l.returnDate <= todayStr;
  });

  // Financial totals calculation
  const totalWaitingBudget = calculateTotalBudget(waitingLeads);
  const totalCompletedBudget = calculateTotalBudget(completedLeads);

  return (
    <div className="space-y-2">
      {/* 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Metric 1: Waiting Leads */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Clientes na Espera</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white">{waitingLeads.length}</span>
            <span className="text-[11px] text-slate-500">pedidos</span>
          </div>
        </div>

        {/* Metric 2: Today / Overdue Return filter */}
        <button
          type="button"
          onClick={onFilterToday}
          className={`p-3 sm:p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between shadow-xs ${
            isTodayFiltered
              ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-700/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-300">Retornos Hoje</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {dueTodayOrOverdue.length}
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">
              {isTodayFiltered ? 'Filtrado' : 'Clique p/ ver'}
            </span>
          </div>
        </button>

        {/* Metric 3: Total Budget in Pipeline (O VALOR TOTAL QUE O VENDEDOR QUERIA VER!) */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/60 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-300">
              Total em Orçamentos
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-lg sm:text-xl font-black text-indigo-300 tracking-tight">
              {formatBRL(totalWaitingBudget)}
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {selectedCategoryName ? `Em ${selectedCategoryName}` : 'Em produtos aguardados'}
            </span>
          </div>
        </div>

        {/* Metric 4: Completed Sales Revenue */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-900/60 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400">Vendas Fechadas</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1">
            <div className="text-lg sm:text-xl font-black text-emerald-400 tracking-tight">
              {formatBRL(totalCompletedBudget)}
            </div>
            <span className="text-[10px] text-emerald-500/80 block">
              {completedLeads.length} {completedLeads.length === 1 ? 'venda concluída' : 'vendas concluídas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
