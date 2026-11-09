import React from 'react';
import {
  MessageSquare,
  Search,
  Settings,
  UserPlus,
  Send,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppSettings } from '../types';

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewCustomerModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenBulkSendModal: () => void;
  selectedCount: number;
  settings: AppSettings;
}

export const Header: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  onOpenNewCustomerModal,
  onOpenSettingsModal,
  onOpenBulkSendModal,
  selectedCount,
  settings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Seller Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Zap<span className="text-emerald-400">Vendedor</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline">
                  Balcão
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                {settings.sellerName ? `${settings.sellerName} • ` : ''}
                {settings.storeName || 'Minha Loja'}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <PWAInstallButton variant="button" />

            {/* Quick Bulk Send Button if any leads selected */}
            {selectedCount > 0 && (
              <button
                onClick={onOpenBulkSendModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 transition active:scale-95 cursor-pointer animate-pulse"
                title="Avisar clientes selecionados com remetente da loja"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Avisar ({selectedCount})</span>
              </button>
            )}

            {/* New Customer Button */}
            <button
              onClick={onOpenNewCustomerModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo Cliente</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettingsModal}
              title="Configurações e Backup"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente, telefone ou produto que quer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
            >
              Limpar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
