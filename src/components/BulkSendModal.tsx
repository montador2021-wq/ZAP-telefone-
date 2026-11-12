import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Users,
  AlertCircle,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CustomerLead, Category, MessageTemplate, AppSettings } from '../types';
import { buildWhatsAppUrl } from '../utils/phone';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leads: CustomerLead[];
  categories: Category[];
  templates: MessageTemplate[];
  settings: AppSettings;
  onMarkContacted: (leadId: string, channel?: 'whatsapp') => void;
}

export const BulkSendModal: React.FC<Props> = ({
  isOpen,
  onClose,
  leads,
  categories,
  templates,
  settings,
  onMarkContacted,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sentLeadIds, setSentLeadIds] = useState<Set<string>>(new Set());
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // Update channel and message when modal opens
  useEffect(() => {
    if (isOpen) {
      setSentLeadIds(new Set());
      const chosen = templates[0];
      if (chosen) {
        setSelectedTemplateId(chosen.id);
        setCustomMessage(chosen.body);
      }
    }
  }, [isOpen, templates]);

  if (!isOpen || leads.length === 0) return null;

  // Replaces dynamic tags for a given customer
  const formatMessageForLead = (templateStr: string, lead: CustomerLead): string => {
    const cat = categories.find((c) => c.id === lead.categoryId);
    return templateStr
      .replace(/{nome}/g, lead.name)
      .replace(/{produto}/g, lead.product)
      .replace(/{categoria}/g, cat?.name || 'produtos')
      .replace(/{vendedor}/g, settings.sellerName || 'Vendedor')
      .replace(/{loja}/g, settings.storeName || 'Nossa Loja')
      .replace(/{data_retorno}/g, lead.returnDate || 'breve');
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplateId(template.id);
    setCustomMessage(template.body);
  };

  // Send to individual customer via WhatsApp
  const handleSendToLead = (lead: CustomerLead) => {
    const personalizedMessage = formatMessageForLead(customMessage, lead);
    const zapUrl = buildWhatsAppUrl(lead.phone, personalizedMessage, settings.countryCode);
    window.open(zapUrl, '_blank', 'noopener,noreferrer');
    onMarkContacted(lead.id, 'whatsapp');
    setSentLeadIds((prev) => new Set(prev).add(lead.id));
  };

  const handleCopyNumbers = () => {
    const numbers = leads.map((l) => l.phone.replace(/\D/g, '')).join(', ');
    navigator.clipboard.writeText(numbers);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const nextUnsentLead = leads.find((l) => !sentLeadIds.has(l.id));
  const total = leads.length;
  const sentCount = sentLeadIds.size;
  const allSent = sentCount === total;
  const progressPercent = Math.round((sentCount / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/20 border-emerald-500/40 text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Mandar WhatsApp para {total} {total === 1 ? 'Cliente' : 'Clientes'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-slate-800 text-emerald-400 border-slate-700">
                  {sentCount} de {total} enviados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Abre o WhatsApp com a mensagem do produto pronta para envio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* WHATSAPP GUIDED QUEUE: STEP-BY-STEP QUICK DISPATCH */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Fila Rápida de Envio no WhatsApp</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {sentCount} de {total} contatados
              </span>
            </div>

            {nextUnsentLead ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block">Próximo da fila:</span>
                    <span className="text-base font-black text-white">{nextUnsentLead.name}</span>
                    <span className="text-xs font-mono text-emerald-300 ml-2">{nextUnsentLead.phone}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Interesse: <strong className="text-emerald-300">{nextUnsentLead.product}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendToLead(nextUnsentLead)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    Abrir WhatsApp de {nextUnsentLead.name.split(' ')[0]} ({sentCount + 1} de {total})
                  </span>
                </button>

                {/* Crucial tip so user hits Send in WhatsApp */}
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-start gap-2 text-xs text-emerald-200">
                  <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Dica:</strong> Ao abrir o WhatsApp, o texto já vai
                    estar escrito. É só <strong>tocar na setinha verde de enviar dentro do WhatsApp</strong> para a
                    mensagem chegar no celular do cliente!
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-white">Todos os clientes foram avisados!</h4>
                <p className="text-xs text-slate-400">
                  As conversas foram abertas no WhatsApp com sucesso.
                </p>
              </div>
            )}
          </div>

          {/* Progress Tracker Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Progresso do Envio:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {sentCount} de {total} enviados ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mensagem Modelo para o WhatsApp:</span>
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'Copiado!' : 'Copiar texto'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {templates.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium transition cursor-pointer border ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <p className="line-clamp-2 leading-tight font-semibold">{tmpl.title}</p>
                </button>
              ))}
            </div>

            {/* Editable template textarea */}
            <div className="relative">
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                placeholder="Digite o texto da mensagem do WhatsApp..."
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                <span>Variáveis automáticas: {'{nome}'}, {'{produto}'}, {'{loja}'}, {'{vendedor}'}</span>
                <span className="text-emerald-400 font-medium">WhatsApp Oficial</span>
              </div>
            </div>
          </div>

          {/* List of Clients with Direct WhatsApp Button */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lista de Clientes ({leads.length}):</span>
              </span>
            </div>

            <div className="space-y-2">
              {leads.map((lead, idx) => {
                const isSent = sentLeadIds.has(lead.id);
                const isNext = !isSent && (!nextUnsentLead || nextUnsentLead.id === lead.id);
                const cat = categories.find((c) => c.id === lead.categoryId);
                const personalizedPreview = formatMessageForLead(customMessage, lead);

                return (
                  <div
                    key={lead.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSent
                        ? 'bg-slate-900/60 border-slate-800 opacity-90'
                        : isNext
                        ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSent
                              ? 'bg-emerald-500 text-slate-950'
                              : isNext
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isSent ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white truncate">{lead.name}</h4>
                            <span className="text-xs font-mono text-slate-300">{lead.phone}</span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                              style={{ backgroundColor: cat?.color || '#10b981' }}
                            >
                              {cat?.name || 'Geral'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 truncate mt-0.5">
                            Interesse: <span className="text-emerald-300 font-medium">{lead.product}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action Button for Lead */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isSent ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Enviado</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSendToLead(lead)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 underline px-1 cursor-pointer"
                            >
                              Reenviar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendToLead(lead)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-md active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Mandar Zap p/ {lead.name.split(' ')[0]}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 font-sans italic line-clamp-2">
                      "{personalizedPreview}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ / TROUBLESHOOTING BOX */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowFaq(!showFaq)}
              className="w-full p-3 flex items-center justify-between text-slate-300 hover:text-white transition font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Como funciona o envio pelo WhatsApp:</span>
              </span>
              {showFaq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFaq && (
              <div className="p-3.5 pt-0 space-y-2.5 text-slate-400 border-t border-slate-800/80">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    <strong className="text-slate-200">Setinha de envio no WhatsApp:</strong> Ao clicar no botão,
                    o WhatsApp abre com o número do cliente e a mensagem toda escrita. Você só precisa apertar a setinha de
                    envio para a mensagem sair.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    <strong className="text-slate-200">DDD do Telefone:</strong> Salve o número sempre com DDD (ex:
                    <code>(11) 98765-4321</code>). O aplicativo adiciona automaticamente o código do Brasil (+55).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick numbers copy */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Quer copiar os telefones dos clientes?</span>
            <button
              type="button"
              onClick={handleCopyNumbers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              {copiedNumbers ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Telefones Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Telefones ({leads.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {allSent
              ? 'Todos os contatos foram realizados!'
              : `${total - sentCount} cliente(s) pendente(s)`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
