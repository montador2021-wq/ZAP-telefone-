import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'button' | 'banner';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // If already installed as a standalone PWA, hide or show subtle badge
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        App Instalado
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGeneralGuide(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-teal-900/40 border border-emerald-700/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Instalar no Celular do Vendedor</p>
              <p className="text-xs text-slate-300">
                Salva direto na memória do celular. Rápido, offline e sem ocupar espaço!
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Instalar como App
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          title="Instalar App no celular"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-950 transition active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar App</span>
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Como instalar no iPhone / iPad</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              O Safari do iOS adiciona o app direto na tela inicial sem precisar da App Store:
            </p>

            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">1. Toque em Compartilhar</span>
                  <span className="text-xs text-slate-400">No botão na barra inferior do navegador Safari.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">2. 'Adicionar à Tela de Início'</span>
                  <span className="text-xs text-slate-400">Role para baixo nas opções e toque nessa opção.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white block">3. Pronto!</span>
                  <span className="text-xs text-slate-400">Ele abre tela cheia e salva na memória do celular.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* General / Android guide if beforeinstallprompt has not fired yet */}
      {showGeneralGuide && !isIOS && !isInstallable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Instalar no Android / Navegador</h3>
            <p className="text-xs text-slate-400 mt-2 mb-4">
              Para instalar este aplicativo no seu aparelho:
            </p>
            <ol className="space-y-2.5 text-sm text-slate-300 list-decimal list-inside">
              <li className="p-2 rounded-lg bg-slate-800/60">
                Toque nos <strong className="text-white">três pontinhos (⋮)</strong> no canto do Google Chrome
              </li>
              <li className="p-2 rounded-lg bg-slate-800/60">
                Selecione <strong className="text-white">'Instalar aplicativo'</strong> ou <strong className="text-white">'Adicionar à tela inicial'</strong>
              </li>
              <li className="p-2 rounded-lg bg-slate-800/60">
                O ícone do ZapVendedor aparecerá junto aos seus outros aplicativos!
              </li>
            </ol>
            <button
              onClick={() => setShowGeneralGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
