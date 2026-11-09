import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Store,
  User,
  Download,
  Upload,
  Share2,
  Check,
  Smartphone,
  HardDrive,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings } from '../types';
import { exportBackupData, importBackupData } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataImported,
}) => {
  const [sellerName, setSellerName] = useState(settings.sellerName);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [countryCode, setCountryCode] = useState(settings.countryCode || '55');
  const [smsSenderName, setSmsSenderName] = useState(settings.smsSenderName || 'LOJA_AVISO');
  const [defaultChannel, setDefaultChannel] = useState<'store_gateway' | 'whatsapp' | 'sms'>(settings.defaultChannel || 'store_gateway');
  const [privacyMode, setPrivacyMode] = useState<'store_only' | 'allow_personal_whatsapp'>(settings.privacyMode || 'store_only');
  const [gatewayApiKey, setGatewayApiKey] = useState(settings.gatewayApiKey || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      sellerName: sellerName.trim() || 'Vendedor',
      storeName: storeName.trim() || 'Minha Loja',
      countryCode: countryCode.trim() || '55',
      smsSenderName: smsSenderName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 11) || 'LOJA',
      defaultChannel,
      privacyMode,
      gatewayProvider: settings.gatewayProvider || 'store_cloud',
      gatewayApiKey: gatewayApiKey.trim() || undefined,
      gatewayAccountSid: settings.gatewayAccountSid,
      gatewayVirtualNumber: settings.gatewayVirtualNumber,
    });
    onClose();
  };

  const handleExport = () => {
    const json = exportBackupData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-zapvendedor-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupData(content);
      if (res.success) {
        setImportStatus('Backup restaurado com sucesso!');
        onDataImported();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleShareApp = () => {
    const url = window.location.href;
    const shareText = `Use este aplicativo para salvar clientes em lista de espera e mandar mensagem no WhatsApp: ${url}`;
    if (navigator.share) {
      navigator.share({
        title: 'ZapVendedor - Lista de Espera & WhatsApp',
        text: shareText,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurações & Backup</h2>
              <p className="text-xs text-slate-400">Personalize seu nome e dados salvos no celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Seller Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seu Nome (usado nas mensagens)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Ex: Carlos Vendedor"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da sua Loja
            </label>
            <div className="relative">
              <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Móveis & Decoração Central"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Country Code & Preferred Channel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                DDI País (ex: 55)
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="55 para Brasil"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Canal Preferido
              </label>
              <select
                value={defaultChannel}
                onChange={(e) => setDefaultChannel(e.target.value as 'store_gateway' | 'whatsapp' | 'sms')}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="store_gateway">🛡️ Remetente da Loja (Sem Meu Número)</option>
                <option value="whatsapp">📱 WhatsApp Pessoal (Mostra número)</option>
                <option value="sms">💬 SMS Celular (Nativo)</option>
              </select>
            </div>
          </div>

          {/* Privacy Mode Selection */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-700/60 space-y-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Proteção do seu Número Pessoal</span>
            </span>

            <div className="space-y-2 text-xs text-slate-300">
              <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg bg-slate-900/80 border border-indigo-900/60">
                <input
                  type="radio"
                  name="privacyMode"
                  checked={privacyMode === 'store_only'}
                  onChange={() => setPrivacyMode('store_only')}
                  className="mt-0.5 text-indigo-500 focus:ring-indigo-500"
                />
                <div>
                  <strong className="text-white block font-bold">100% Ocultar Meu Número (Recomendado)</strong>
                  <span className="text-slate-400 text-[11px] leading-tight block">
                    O app prioriza o envio com o nome da loja. Seu celular e seu chip nunca são mostrados para o cliente.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                <input
                  type="radio"
                  name="privacyMode"
                  checked={privacyMode === 'allow_personal_whatsapp'}
                  onChange={() => setPrivacyMode('allow_personal_whatsapp')}
                  className="mt-0.5 text-indigo-500 focus:ring-indigo-500"
                />
                <div>
                  <strong className="text-slate-200 block font-semibold">Permitir WhatsApp Pessoal</strong>
                  <span className="text-slate-400 text-[11px] leading-tight block">
                    Exibe o botão de WhatsApp pessoal nos cartões dos clientes.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SMS Corporate Sender Name (Remetente Personalizado) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Remetente do SMS (Nome da Loja)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Máx 11 letras</span>
            </div>
            <input
              type="text"
              maxLength={11}
              value={smsSenderName}
              onChange={(e) => setSmsSenderName(e.target.value.toUpperCase())}
              placeholder="Ex: LOJA, AVISO"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-sky-300 text-sm font-mono tracking-wider focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 leading-tight">
              Aparece como o nome da sua empresa no celular do cliente (ex: <strong>{smsSenderName || 'LOJA'}</strong>) em serviços de SMS corporativo.
            </p>
          </div>

          {/* SMS Gateway API Key (Opcional - Para envio real de SMS com remetente LOJA) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chave de API de SMS (Opcional)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">SMS Dev / Twilio</span>
            </div>
            <input
              type="password"
              value={gatewayApiKey}
              onChange={(e) => setGatewayApiKey(e.target.value)}
              placeholder="Cole sua chave de API aqui se tiver"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 leading-tight">
              Se você não tiver chave de SMS, não se preocupe: você pode enviar diretamente pelo <strong>WhatsApp</strong> ou pelo <strong>SMS do celular</strong> sem pagar nada!
            </p>
          </div>

          {/* Memory / Storage / Backup section */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Memória do Celular & Compartilhamento</span>
            </div>
            <p className="text-xs text-slate-400">
              Todos os clientes e categorias ficam salvos localmente no armazenamento do seu dispositivo. Você pode exportar ou compartilhar o link com outro vendedor.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar Backup</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Restaurar Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-400 font-medium bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/60">
                {importStatus}
              </p>
            )}

            {/* Share app link */}
            <button
              type="button"
              onClick={handleShareApp}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-emerald-900/40 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {copiedLink
                  ? 'Link do Aplicativo Copiado!'
                  : 'Compartilhar Link do App com Colega Vendedor'}
              </span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
