import React from 'react';
import {
  MessageSquare,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Tag,
  Clock,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { CustomerLead, Category, LeadStatus } from '../types';
import { getReturnDateInfo, buildWhatsAppUrl } from '../utils/phone';
import { formatBRL, parseCurrencyToNumber } from '../utils/currency';

interface Props {
  lead: CustomerLead;
  category?: Category;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (lead: CustomerLead) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, newStatus: LeadStatus) => void;
  onOpenSendModal: (lead: CustomerLead) => void;
  sellerName?: string;
  storeName?: string;
}

export const CustomerCard: React.FC<Props> = ({
  lead,
  category,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onChangeStatus,
  onOpenSendModal,
  sellerName,
  storeName,
}) => {
  const returnInfo = getReturnDateInfo(lead.returnDate);
  const catColor = category?.color || '#10b981';

  // Fast direct WhatsApp message
  const defaultQuickMessage = `Olá, ${lead.name}! Tudo bem? Boas notícias: o produto que você estava procurando (${lead.product}) chegou na ${
    storeName || 'loja'
  }! Reservei pra você. Consegue vir retirar ou quer fotos?`;

  const directZapUrl = buildWhatsAppUrl(lead.phone, defaultQuickMessage);

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isSelected
          ? 'bg-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-950/40'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80'
      }`}
    >
      {/* Category colored top bar accent */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: catColor }}
      />

      <div className="p-4 sm:p-4.5 space-y-3">
        {/* Top row: Checkbox, Name, Category Pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(lead.id)}
              className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>{lead.name}</span>
                {lead.contactCount > 0 && (
                  <span
                    title={`Contatado ${lead.contactCount}x pelo WhatsApp`}
                    className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-400 border border-blue-800"
                  >
                    Zap {lead.contactCount}x
                  </span>
                )}
              </h3>
              <p className="text-xs font-mono text-slate-400">{lead.phone}</p>
            </div>
          </div>

          {/* Category Pill with custom color */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shrink-0 shadow-xs"
            style={{ backgroundColor: catColor }}
          >
            <Tag className="w-3 h-3" />
            <span>{category?.name || 'Geral'}</span>
          </span>
        </div>

        {/* Product Desired Box */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
            Produto Esperado:
          </div>
          <div className="text-sm font-semibold text-emerald-300">
            {lead.product}
          </div>
        </div>

        {/* Return Date + Price Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {lead.returnDate && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium ${returnInfo.colorClass}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{returnInfo.text}</span>
            </div>
          )}

          {lead.priceEstimate && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold shadow-xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatBRL(parseCurrencyToNumber(lead.priceEstimate))}</span>
            </div>
          )}

          {/* Status Badge */}
          {lead.status === 'waiting' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-800/50 text-[11px] font-medium">
              <Clock className="w-3 h-3" />
              Na Espera
            </span>
          )}
          {lead.status === 'contacted' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/60 text-[11px] font-medium">
              <MessageSquare className="w-3 h-3" />
              Já Avisado
            </span>
          )}
          {lead.status === 'completed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Venda Finalizada!
            </span>
          )}
        </div>

        {/* Notes if present */}
        {lead.notes && (
          <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-950/30 p-2 rounded-lg border border-slate-800/40">
            "{lead.notes}"
          </p>
        )}

        {/* Action Buttons Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* Status Quick Action: Marcar como finalizado / Reativar */}
          {lead.status === 'completed' ? (
            <button
              onClick={() => onChangeStatus(lead.id, 'waiting')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Voltar para a lista de espera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reativar na Espera</span>
            </button>
          ) : (
            <button
              onClick={() => onChangeStatus(lead.id, 'completed')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition cursor-pointer active:scale-95"
              title="Marcar que o cliente veio e comprou"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finalizar Venda</span>
            </button>
          )}

          {/* Right actions: Edit, Delete, WhatsApp */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(lead)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Editar dados"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Excluir ${lead.name} da lista?`)) {
                  onDelete(lead.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
              title="Excluir cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Action: Mandar Zap (Abre WhatsApp com mensagem pronta) */}
            <button
              onClick={() => onOpenSendModal(lead)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95"
              title="Abre o WhatsApp com mensagem pronta"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Mandar Zap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
