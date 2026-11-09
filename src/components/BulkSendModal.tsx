import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Users,
  AlertCircle,
  ShieldCheck,
  Lock,
  Zap,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CustomerLead, Category, MessageTemplate, AppSettings } from '../types';
import { buildWhatsAppUrl, buildSmsUrl } from '../utils/phone';
import { sendRealSmsMessage } from '../utils/smsGateway';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leads: CustomerLead[];
  categories: Category[];
  templates: MessageTemplate[];
  settings: AppSettings;
  onMarkContacted: (leadId: string, channel?: 'whatsapp' | 'sms' | 'sms_gateway') => void;
  initialChannel?: 'store_gateway' | 'whatsapp' | 'sms';
}

export const BulkSendModal: React.FC<Props> = ({
  isOpen,
  onClose,
  leads,
  categories,
  templates,
  settings,
  onMarkContacted,
  initialChannel = 'whatsapp',
}) => {
  // If no SMS API key is configured, default to 'whatsapp' so real messages actually arrive!
  const effectiveInitialChannel =
    initialChannel === 'store_gateway' && !settings.gatewayApiKey ? 'whatsapp' : initialChannel;

  const [channel, setChannel] = useState<'store_gateway' | 'whatsapp' | 'sms'>(effectiveInitialChannel);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sentLeadIds, setSentLeadIds] = useState<Set<string>>(new Set());
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // SMS Gateway Real Dispatch State
  const [isSendingGateway, setIsSendingGateway] = useState(false);
  const [gatewayDeliveryLogs, setGatewayDeliveryLogs] = useState<
    Array<{ id: string; leadName: string; phone: string; status: string; success: boolean }>
  >([]);

  // Update channel and message when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultToUse =
        initialChannel === 'store_gateway' && !settings.gatewayApiKey ? 'whatsapp' : initialChannel;
      setChannel(defaultToUse);
      setSentLeadIds(new Set());
      setGatewayDeliveryLogs([]);

      // Select appropriate template
      const isShortChannel = defaultToUse === 'store_gateway' || defaultToUse === 'sms';
      const matching = templates.find((t) => (isShortChannel ? t.channel === 'sms' : t.channel !== 'sms'));
      const chosen = matching || templates[0];
      if (chosen) {
        setSelectedTemplateId(chosen.id);
        setCustomMessage(chosen.body);
      }
    }
  }, [isOpen, initialChannel, templates, settings.gatewayApiKey]);

  const handleSwitchChannel = (newChannel: 'store_gateway' | 'whatsapp' | 'sms') => {
    setChannel(newChannel);
    const isShortChannel = newChannel === 'store_gateway' || newChannel === 'sms';
    const matching = templates.find((t) => (isShortChannel ? t.channel === 'sms' : t.channel !== 'sms'));
    if (matching) {
      setSelectedTemplateId(matching.id);
      setCustomMessage(matching.body);
    }
  };

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

  // Send to individual customer
  const handleSendToLead = async (lead: CustomerLead) => {
    const personalizedMessage = formatMessageForLead(customMessage, lead);

    if (channel === 'store_gateway') {
      if (!settings.gatewayApiKey) {
        // Not configured, switch to WhatsApp or SMS
        alert(
          'Para enviar SMS com nome da LOJA sem expor seu chip, configure a chave de API de SMS em Configurações. Use o WhatsApp ou o SMS do Celular para a mensagem chegar de verdade agora!'
        );
        return;
      }

      setIsSendingGateway(true);
      const res = await sendRealSmsMessage(lead, personalizedMessage, settings);
      setIsSendingGateway(false);

      setGatewayDeliveryLogs((prev) => [
        ...prev,
        {
          id: lead.id,
          leadName: lead.name,
          phone: lead.phone,
          status: res.message,
          success: res.success,
        },
      ]);

      if (res.success) {
        onMarkContacted(lead.id, 'sms_gateway');
        setSentLeadIds((prev) => new Set(prev).add(lead.id));
      }
    } else if (channel === 'whatsapp') {
      const zapUrl = buildWhatsAppUrl(lead.phone, personalizedMessage, settings.countryCode);
      window.open(zapUrl, '_blank', 'noopener,noreferrer');
      onMarkContacted(lead.id, 'whatsapp');
      setSentLeadIds((prev) => new Set(prev).add(lead.id));
    } else {
      const smsUrl = buildSmsUrl(lead.phone, personalizedMessage, settings.countryCode);
      window.location.href = smsUrl;
      onMarkContacted(lead.id, 'sms');
      setSentLeadIds((prev) => new Set(prev).add(lead.id));
    }
  };

  // Disparar Gateway Real para todos
  const handleDispatchAllStoreGateway = async () => {
    if (!settings.gatewayApiKey) {
      alert(
        'Nenhum provedor de SMS conectado. Use o WhatsApp para enviar gratuitamente e a mensagem chegar de verdade!'
      );
      setChannel('whatsapp');
      return;
    }

    setIsSendingGateway(true);
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const msg = formatMessageForLead(customMessage, lead);
      const res = await sendRealSmsMessage(lead, msg, settings);

      setGatewayDeliveryLogs((prev) => [
        ...prev,
        {
          id: lead.id,
          leadName: lead.name,
          phone: lead.phone,
          status: res.message,
          success: res.success,
        },
      ]);

      if (res.success) {
        setSentLeadIds((prev) => new Set(prev).add(lead.id));
        onMarkContacted(lead.id, 'sms_gateway');
      }
    }
    setIsSendingGateway(false);
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

  const charCount = customMessage.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                channel === 'whatsapp'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : channel === 'sms'
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                  : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
              }`}
            >
              {channel === 'whatsapp' ? (
                <MessageSquare className="w-5 h-5" />
              ) : channel === 'sms' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Enviar Mensagem para {total} {total === 1 ? 'Cliente' : 'Clientes'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-slate-800 text-slate-300 border-slate-700">
                  {sentCount} de {total} enviados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {channel === 'whatsapp'
                  ? 'WhatsApp Oficial: Mensagem direta 100% garantida e gratuita'
                  : channel === 'sms'
                  ? 'SMS Nativo do Celular: Envia pelo aplicativo de SMS do seu aparelho'
                  : 'SMS Corporativo: Envia através de provedor de SMS'}
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

        {/* Channel Selector */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Opção 1: WhatsApp Oficial (Recomendado & 100% Real) */}
            <button
              type="button"
              onClick={() => handleSwitchChannel('whatsapp')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                channel === 'whatsapp'
                  ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black flex items-center gap-1.5 ${
                    channel === 'whatsapp' ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500 text-slate-950">
                  100% Garantido
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Abre o WhatsApp com a mensagem pronta. É só tocar na setinha verde e enviar!
              </p>
            </button>

            {/* Opção 2: SMS do Celular */}
            <button
              type="button"
              onClick={() => handleSwitchChannel('sms')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                channel === 'sms'
                  ? 'bg-sky-950/90 border-sky-500 ring-2 ring-sky-500/40 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black flex items-center gap-1.5 ${
                    channel === 'sms' ? 'text-sky-300' : 'text-slate-300'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span>SMS Celular</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-sky-900/60 text-sky-300">
                  App do Celular
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Abre o app de mensagens do seu celular para enviar pelo seu chip.
              </p>
            </button>

            {/* Opção 3: Remetente da Loja (Requer Chave API de SMS) */}
            <button
              type="button"
              onClick={() => handleSwitchChannel('store_gateway')}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                channel === 'store_gateway'
                  ? 'bg-indigo-950/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black flex items-center gap-1.5 ${
                    channel === 'store_gateway' ? 'text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Remetente Loja</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-800 text-slate-400">
                  {settings.gatewayApiKey ? 'Conectado' : 'Requer API'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Envia via SMS corporativo com nome da loja sem expor seu chip pessoal.
              </p>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* CRITICAL NOTICE: Explains why SMS didn't arrive without a provider */}
          {channel === 'store_gateway' && !settings.gatewayApiKey && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/60 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Por que a mensagem não chega sem provedor conectado?
                  </h4>
                  <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                    Para um SMS viajar pela antena das operadoras (Vivo, Claro, Tim) e tocar no celular de
                    alguém com o nome da loja sem mostrar seu chip particular, as operadoras exigem uma conta de{' '}
                    <strong>Gateway de SMS</strong> (como SMS Dev, Twilio ou Comtele).
                  </p>
                  <p className="text-xs text-slate-300 mt-1.5">
                    Para que a mensagem <strong>chegue de verdade no celular do cliente agora mesmo</strong>,
                    recomendamos usar o <strong>WhatsApp</strong>:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchChannel('whatsapp')}
                  className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Mudar para WhatsApp (Chega na Hora!)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchChannel('sms')}
                  className="p-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mudar para SMS do Celular</span>
                </button>
              </div>
            </div>
          )}

          {/* WHATSAPP GUIDED QUEUE: STEP-BY-STEP QUICK DISPATCH */}
          {channel === 'whatsapp' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Disparo Rápido 1 a 1 no WhatsApp</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {sentCount} de {total} enviados
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
                      <strong className="text-white">Atenção ao abrir o WhatsApp:</strong> O texto e o número já
                      aparecem prontos. Você só precisa <strong>tocar na setinha verde de enviar</strong> dentro do
                      WhatsApp para a mensagem ir para o celular do cliente!
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
                    As mensagens foram abertas no WhatsApp com sucesso.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SMS GATEWAY DISPATCH (If API is configured) */}
          {channel === 'store_gateway' && settings.gatewayApiKey && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/50 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 block">
                    SMS Corporativo Real
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Disparar para os {total} clientes via API
                  </h3>
                  <p className="text-xs text-slate-300">
                    Remetente configurado: <strong className="text-indigo-300">{settings.smsSenderName || 'LOJA'}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSendingGateway}
                  onClick={handleDispatchAllStoreGateway}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-slate-950 font-black text-sm shadow-xl shadow-indigo-500/30 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSendingGateway ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Transmitindo SMS para a operadora...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Disparar para Todos ({total})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Progress Tracker Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    channel === 'whatsapp'
                      ? 'text-emerald-400'
                      : channel === 'sms'
                      ? 'text-sky-400'
                      : 'text-indigo-400'
                  }`}
                />
                <span>Progresso do Envio:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {sentCount} de {total} enviados ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  channel === 'whatsapp'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : channel === 'sms'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-400'
                    : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Escolher Mensagem Modelo:</span>
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                {copiedMessage ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'Copiado!' : 'Copiar texto'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates
                .filter((t) => (channel === 'whatsapp' ? t.channel !== 'sms' : t.channel === 'sms'))
                .map((tmpl) => (
                  <button
                    type="button"
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-2 rounded-xl text-left text-xs font-medium transition cursor-pointer border ${
                      selectedTemplateId === tmpl.id
                        ? channel === 'whatsapp'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                          : channel === 'sms'
                          ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                          : 'bg-indigo-950/80 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50'
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
                rows={channel === 'whatsapp' ? 3 : 2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                placeholder="Digite o texto da mensagem..."
              />
              {channel !== 'whatsapp' && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                  <span>
                    {charCount}/160 caracteres ({smsSegments} SMS)
                  </span>
                  <span className="text-slate-400">Mensagens objetivas têm maior leitura</span>
                </div>
              )}
            </div>
          </div>

          {/* List of Clients with Direct Action */}
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
                        ? channel === 'whatsapp'
                          ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30'
                          : channel === 'sms'
                          ? 'bg-slate-800/90 border-sky-500 ring-2 ring-sky-500/30'
                          : 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30'
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
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-md active:scale-95 ${
                              channel === 'whatsapp'
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400'
                                : channel === 'sms'
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 ring-2 ring-sky-400'
                                : 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 ring-2 ring-indigo-400'
                            }`}
                          >
                            {channel === 'whatsapp' ? (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Zap para {lead.name.split(' ')[0]}</span>
                              </>
                            ) : channel === 'sms' ? (
                              <>
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>SMS para {lead.name.split(' ')[0]}</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>SMS Loja para {lead.name.split(' ')[0]}</span>
                              </>
                            )}
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

          {/* Gateway Delivery Report (when real API is used) */}
          {gatewayDeliveryLogs.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-300">Relatório de Envio SMS:</span>
              {gatewayDeliveryLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <span className="text-white font-medium">
                    {log.leadName} ({log.phone})
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 text-[11px] ${
                      log.success ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {log.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* FAQ / TROUBLESHOOTING BOX - EXPLAINS WHY MESSAGES DON'T ARRIVE */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowFaq(!showFaq)}
              className="w-full p-3 flex items-center justify-between text-slate-300 hover:text-white transition font-semibold"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>A mensagem não chegou no celular? Veja o que verificar:</span>
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
                    <strong className="text-slate-200">No WhatsApp:</strong> Ao clicar no botão, o WhatsApp
                    abre com o número e o texto já preenchidos. Você <strong>precisa tocar na setinha verde de enviar</strong>{' '}
                    dentro do aplicativo do WhatsApp para a mensagem sair para o cliente.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    <strong className="text-slate-200">No SMS do Celular:</strong> O botão abre o seu aplicativo de
                    mensagens nativo com o número e texto. É necessário tocar no botão de enviar do celular para
                    despachar pelo seu chip de operadora.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <p>
                    <strong className="text-slate-200">DDD do Telefone:</strong> Certifique-se de que o número do
                    cliente tem o DDD completo (ex: <code>(11) 98765-4321</code>). Se faltar o DDD ou o dígito 9,
                    o WhatsApp ou a operadora não conseguem encontrar o aparelho.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <p>
                    <strong className="text-slate-200">Remetente com Nome da Loja (Sem Meu Número):</strong> Para
                    enviar sem mostrar seu chip através de um nome corporativo (como LOJA), é necessário conectar
                    uma chave de provedor de SMS (ex: SMS Dev ou Twilio) em Configurações. Sem isso, use a opção
                    WhatsApp que funciona imediatamente.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick numbers copy */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Quer colar os números em outra ferramenta?</span>
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
