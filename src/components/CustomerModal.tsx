import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Package,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Category, CustomerLead, LeadStatus } from '../types';
import { formatPhoneNumber, buildWhatsAppUrl } from '../utils/phone';
import { formatBRL, parseCurrencyToNumber } from '../utils/currency';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<CustomerLead, 'id' | 'createdAt' | 'updatedAt' | 'contactCount'> & { id?: string }) => void;
  leadToEdit?: CustomerLead | null;
  categories: Category[];
  initialCategoryId?: string | null;
}

export const CustomerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
  categories,
  initialCategoryId,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<LeadStatus>('waiting');
  const [priceEstimate, setPriceEstimate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name);
      setPhone(leadToEdit.phone);
      setProduct(leadToEdit.product);
      setCategoryId(leadToEdit.categoryId);
      setStatus(leadToEdit.status);
      setPriceEstimate(leadToEdit.priceEstimate || '');
      setReturnDate(leadToEdit.returnDate || '');
      setNotes(leadToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setProduct('');
      // Default to initialCategoryId or first category
      setCategoryId(
        initialCategoryId && categories.some((c) => c.id === initialCategoryId)
          ? initialCategoryId
          : categories[0]?.id || ''
      );
      setStatus('waiting');
      setPriceEstimate('');
      // Default return date to 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setReturnDate(d.toISOString().split('T')[0]);
      setNotes('');
    }
  }, [leadToEdit, isOpen, initialCategoryId, categories]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const setShortcutDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setReturnDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !product.trim() || !categoryId) return;

    onSave({
      id: leadToEdit?.id,
      name: name.trim(),
      phone: phone.trim(),
      product: product.trim(),
      categoryId,
      status,
      priceEstimate: priceEstimate.trim() || undefined,
      returnDate: returnDate || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {leadToEdit ? 'Editar Cliente na Espera' : 'Novo Cliente / Pedido'}
              </h2>
              <p className="text-xs text-slate-400">
                Salve os dados para avisar no WhatsApp quando o produto chegar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Cliente <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Dona Márcia"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp com DDD <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Product Wanted */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Produto que o cliente quer <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Package className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ex: Mesa 6 cadeiras madeira maciça com vidro"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria do Produto <span className="text-emerald-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Etiqueta / Situação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="waiting">⏳ Na Espera (Aguardando produto)</option>
                <option value="contacted">💬 Já Contatado / Mensagem enviada</option>
                <option value="completed">🎉 Finalizado (Venda Concluída!)</option>
                <option value="cancelled">❌ Cancelado / Não teve interesse</option>
              </select>
            </div>
          </div>

          {/* Return Date ("Dia do Retorno") & Price Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dia do Retorno / Chegada</span>
                </label>
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
              {/* Quick Date Shortcuts */}
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShortcutDate(0)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setShortcutDate(1)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Amanhã
                </button>
                <button
                  type="button"
                  onClick={() => setShortcutDate(3)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  3 dias
                </button>
                <button
                  type="button"
                  onClick={() => setShortcutDate(7)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  1 semana
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Valor Previsto / Orçamento
                </label>
                {priceEstimate && (
                  <span className="text-[11px] font-bold text-emerald-400">
                    Soma no Total: {formatBRL(parseCurrencyToNumber(priceEstimate))}
                  </span>
                )}
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  value={priceEstimate}
                  onChange={(e) => setPriceEstimate(e.target.value)}
                  onBlur={() => {
                    const parsed = parseCurrencyToNumber(priceEstimate);
                    if (parsed > 0) {
                      setPriceEstimate(formatBRL(parsed));
                    }
                  }}
                  placeholder="Ex: 1500 ou R$ 1.500,00"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPriceEstimate('R$ 350,00')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  R$ 350
                </button>
                <button
                  type="button"
                  onClick={() => setPriceEstimate('R$ 800,00')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  R$ 800
                </button>
                <button
                  type="button"
                  onClick={() => setPriceEstimate('R$ 1.500,00')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  R$ 1.500
                </button>
                <button
                  type="button"
                  onClick={() => setPriceEstimate('R$ 2.800,00')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  R$ 2.800
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Anotações do Vendedor (detalhes, medidas, cor preferida)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Cliente prefere madeira escura. Ligar após as 14h."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* WhatsApp Direct Test Link if phone is filled */}
          {phone.replace(/\D/g, '').length >= 10 && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <MessageSquare className="w-4 h-4" />
                <span>Link direto para WhatsApp pronto</span>
              </div>
              <a
                href={buildWhatsAppUrl(
                  phone,
                  `Olá, ${name || 'amigo(a)'}! Tudo bem? Aqui é da loja sobre o ${product || 'produto'}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
              >
                Abrir WhatsApp
              </a>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {leadToEdit ? 'Salvar Alterações' : 'Salvar na Lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
