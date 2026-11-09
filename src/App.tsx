import React, { useState, useEffect } from 'react';
import {
  Plus,
  Send,
  Users,
  CheckCircle,
  Tag,
  AlertCircle,
  Clock,
  Filter,
  CheckSquare,
  Square,
  Share2,
  ShieldCheck,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { Category, CustomerLead, LeadStatus, MessageTemplate, AppSettings } from './types';
import {
  loadCategories,
  saveCategories,
  loadLeads,
  saveLeads,
  loadSettings,
  saveSettings,
  loadTemplates,
  saveTemplates,
  DEFAULT_CATEGORIES,
} from './utils/storage';
import { calculateTotalBudget, formatBRL } from './utils/currency';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { CategoryBar } from './components/CategoryBar';
import { CustomerCard } from './components/CustomerCard';
import { CustomerModal } from './components/CustomerModal';
import { CategoryModal } from './components/CategoryModal';
import { BulkSendModal } from './components/BulkSendModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // State
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [leads, setLeads] = useState<CustomerLead[]>(loadLeads);
  const [templates, setTemplates] = useState<MessageTemplate[]>(loadTemplates);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Filters & Navigation
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCompletedView, setIsCompletedView] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTodayFiltered, setIsTodayFiltered] = useState<boolean>(false);

  // Selection for bulk sending
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [leadToEdit, setLeadToEdit] = useState<CustomerLead | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isBulkSendModalOpen, setIsBulkSendModalOpen] = useState<boolean>(false);
  const [leadsToSend, setLeadsToSend] = useState<CustomerLead[]>([]);
  const [bulkSendChannel, setBulkSendChannel] = useState<'store_gateway' | 'whatsapp' | 'sms'>('store_gateway');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Synchronize state with storage
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  // Lead CRUD handlers
  const handleSaveLead = (
    data: Omit<CustomerLead, 'id' | 'createdAt' | 'updatedAt' | 'contactCount'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    if (data.id) {
      // Edit existing
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === data.id
            ? {
                ...lead,
                ...data,
                updatedAt: now,
              }
            : lead
        )
      );
    } else {
      // New lead
      const newLead: CustomerLead = {
        id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.name,
        phone: data.phone,
        product: data.product,
        categoryId: data.categoryId,
        status: data.status || 'waiting',
        priceEstimate: data.priceEstimate,
        returnDate: data.returnDate,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
        contactCount: 0,
      };
      setLeads((prev) => [newLead, ...prev]);
    }
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleChangeStatus = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) return lead;
        return {
          ...lead,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleMarkContacted = (
    leadId: string,
    channel: 'whatsapp' | 'sms' | 'sms_gateway' = 'whatsapp'
  ) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        return {
          ...lead,
          status: lead.status === 'waiting' ? 'contacted' : lead.status,
          contactCount: (lead.contactCount || 0) + 1,
          lastContactedAt: new Date().toISOString(),
          lastContactChannel: channel,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Category CRUD handlers
  const handleSaveCategory = (
    data: Omit<Category, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (data.id) {
      // Edit
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === data.id
            ? { ...cat, name: data.name, color: data.color, description: data.description }
            : cat
        )
      );
    } else {
      // Create new
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        color: data.color,
        description: data.description,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      setSelectedCategoryId(newCat.id);
    }
  };

  const handleDeleteCategory = (catId: string) => {
    // If deleted category was active, reset to all
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
    }
    // Reassign leads in this category to first category or generic
    const fallbackCatId = categories.find((c) => c.id !== catId)?.id || 'cat-geral';
    setLeads((prev) =>
      prev.map((l) => (l.categoryId === catId ? { ...l, categoryId: fallbackCatId } : l))
    );
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  // Selection handlers
  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered Leads calculation
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredLeads = leads.filter((lead) => {
    // Completed vs Active view
    if (isCompletedView) {
      if (lead.status !== 'completed') return false;
    } else {
      if (lead.status === 'completed' || lead.status === 'cancelled') return false;
    }

    // Category filter
    if (selectedCategoryId && lead.categoryId !== selectedCategoryId) {
      return false;
    }

    // Today/Overdue filter
    if (isTodayFiltered) {
      if (!lead.returnDate || lead.returnDate > todayStr) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = lead.name.toLowerCase().includes(q);
      const matchesPhone = lead.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
      const matchesProduct = lead.product.toLowerCase().includes(q);
      const matchesNotes = lead.notes?.toLowerCase().includes(q);
      if (!matchesName && !matchesPhone && !matchesProduct && !matchesNotes) {
        return false;
      }
    }

    return true;
  });

  const selectAllFiltered = () => {
    if (selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  // Bulk send opener
  const handleOpenBulkSend = (
    leadsList?: CustomerLead[],
    channel: 'store_gateway' | 'whatsapp' | 'sms' = 'whatsapp'
  ) => {
    // If store_gateway is passed but no API key is set, prefer whatsapp
    const effectiveChannel =
      channel === 'store_gateway' && !settings.gatewayApiKey ? 'whatsapp' : channel;
    setBulkSendChannel(effectiveChannel);
    if (leadsList && leadsList.length > 0) {
      setLeadsToSend(leadsList);
    } else {
      const selected = leads.filter((l) => selectedLeadIds.has(l.id));
      if (selected.length > 0) {
        setLeadsToSend(selected);
      } else if (filteredLeads.length > 0) {
        setLeadsToSend(filteredLeads);
      }
    }
    setIsBulkSendModalOpen(true);
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);
  const filteredTotalBudget = calculateTotalBudget(filteredLeads);
  const selectedLeads = leads.filter((l) => selectedLeadIds.has(l.id));
  const selectedTotalBudget = calculateTotalBudget(selectedLeads);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewCustomerModal={() => {
          setLeadToEdit(null);
          setIsCustomerModalOpen(true);
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenBulkSendModal={() => handleOpenBulkSend()}
        selectedCount={selectedLeadIds.size}
        settings={settings}
      />

      <main className="max-w-4xl mx-auto w-full px-4 pt-4 sm:pt-6 space-y-4 flex-1">
        {/* PWA Install Banner (only shows when uninstalled on mobile/browser) */}
        <PWAInstallButton variant="banner" />

        {/* Stats Metrics Bar with Total Budget */}
        <StatsBar
          leads={leads}
          onFilterToday={() => setIsTodayFiltered((prev) => !prev)}
          isTodayFiltered={isTodayFiltered}
          selectedCategoryName={selectedCategoryObj?.name}
          isCompletedView={isCompletedView}
        />

        {/* Category Pill Bar with custom colors */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          isCompletedView={isCompletedView}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setIsTodayFiltered(false);
          }}
          onToggleCompletedView={(showCompleted) => {
            setIsCompletedView(showCompleted);
            setIsTodayFiltered(false);
          }}
          onOpenNewCategoryModal={() => {
            setCategoryToEdit(null);
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(cat) => {
            setCategoryToEdit(cat);
            setIsCategoryModalOpen(true);
          }}
          leads={leads}
        />

        {/* Delivery & Channel Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Disparo Direto & Seguro aos Clientes</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500 text-slate-950">
                  Pronto p/ Usar
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Envie pelo <strong>WhatsApp oficial</strong> (chega na hora com mensagem pronta) ou via <strong>SMS</strong> do aparelho.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-[11px] text-emerald-400 hover:text-white underline font-semibold shrink-0 cursor-pointer"
          >
            Ajustar Remetente & Loja
          </button>
        </div>

        {/* Action Header above customer list: Bulk triggers, Select all & Total Budget */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-900">
          <div className="flex items-center gap-2 flex-wrap">
            {filteredLeads.length > 0 && (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition cursor-pointer"
              >
                {selectedLeadIds.size > 0 &&
                selectedLeadIds.size === filteredLeads.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  {selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0
                    ? 'Desmarcar Todos'
                    : 'Selecionar Todos'}
                </span>
              </button>
            )}

            <span className="text-xs text-slate-400">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'cliente' : 'clientes'}{' '}
              {isCompletedView ? 'finalizados' : 'na espera'}
            </span>

            {/* Total Budget Pill - EXACTLY WHAT THE SELLER ASKED FOR */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-indigo-900/60 text-xs font-bold shadow-xs">
              <span className="text-slate-400 text-[11px]">
                {selectedLeadIds.size > 0 ? 'Total Selecionado:' : 'Total Orçamento:'}
              </span>
              <span className="text-emerald-400 font-mono text-xs">
                {formatBRL(selectedLeadIds.size > 0 ? selectedTotalBudget : filteredTotalBudget)}
              </span>
            </div>
          </div>

          {/* Category Broadcast / Bulk Send Button with Budget */}
          {!isCompletedView && filteredLeads.length > 0 && (
            <button
              onClick={() => {
                const targetLeads =
                  selectedLeadIds.size > 0
                    ? leads.filter((l) => selectedLeadIds.has(l.id))
                    : filteredLeads;
                handleOpenBulkSend(targetLeads, 'whatsapp');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>
                {selectedLeadIds.size > 0
                  ? `Mandar Zap p/ ${selectedLeadIds.size} selecionados (${formatBRL(selectedTotalBudget)})`
                  : selectedCategoryObj
                  ? `Mandar Zap p/ todos de ${selectedCategoryObj.name} (${formatBRL(filteredTotalBudget)})`
                  : `Mandar Zap p/ ${filteredLeads.length} clientes (${formatBRL(filteredTotalBudget)})`}
              </span>
            </button>
          )}
        </div>

        {/* Customer Leads List */}
        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredLeads.map((lead) => {
              const cat = categories.find((c) => c.id === lead.categoryId);
              return (
                <CustomerCard
                  key={lead.id}
                  lead={lead}
                  category={cat}
                  isSelected={selectedLeadIds.has(lead.id)}
                  onToggleSelect={toggleSelectLead}
                  onEdit={(l) => {
                    setLeadToEdit(l);
                    setIsCustomerModalOpen(true);
                  }}
                  onDelete={handleDeleteLead}
                  onChangeStatus={handleChangeStatus}
                  onOpenSendModal={(l, ch) => handleOpenBulkSend([l], ch || settings.defaultChannel || 'store_gateway')}
                  sellerName={settings.sellerName}
                  storeName={settings.storeName}
                  privacyMode={settings.privacyMode}
                  smsSenderName={settings.smsSenderName}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 px-4 rounded-3xl bg-slate-900/50 border border-slate-800/80 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              {isCompletedView ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <Users className="w-7 h-7" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isCompletedView
                  ? 'Nenhum cliente finalizado ainda'
                  : isTodayFiltered
                  ? 'Nenhum retorno agendado para hoje!'
                  : searchQuery
                  ? 'Nenhum cliente encontrado para sua busca'
                  : selectedCategoryObj
                  ? `Nenhum cliente na categoria "${selectedCategoryObj.name}"`
                  : 'Nenhum cliente na lista de espera'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {isCompletedView
                  ? 'Quando um cliente comprar o produto desejado, marque como "Finalizar Venda" no cartão dele para registrar o sucesso aqui.'
                  : isTodayFiltered
                  ? 'Todos os retornos de hoje já foram contatados ou estão em dia.'
                  : 'Anote o nome do cliente que veio na loja procurando um produto para não perder a venda quando a mercadoria chegar.'}
              </p>
            </div>

            {!isCompletedView && (
              <button
                onClick={() => {
                  setLeadToEdit(null);
                  setIsCustomerModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeiro Cliente</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile: Quick Add Customer */}
      <button
        onClick={() => {
          setLeadToEdit(null);
          setIsCustomerModalOpen(true);
        }}
        className="sm:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950/80 active:scale-95 transition cursor-pointer"
        title="Cadastrar novo cliente"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setLeadToEdit(null);
        }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
        categories={categories}
        initialCategoryId={selectedCategoryId}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        categoryToEdit={categoryToEdit}
        customerCount={
          categoryToEdit
            ? leads.filter((l) => l.categoryId === categoryToEdit.id).length
            : 0
        }
      />

      <BulkSendModal
        isOpen={isBulkSendModalOpen}
        onClose={() => setIsBulkSendModalOpen(false)}
        leads={leadsToSend}
        categories={categories}
        templates={templates}
        settings={settings}
        onMarkContacted={handleMarkContacted}
        initialChannel={bulkSendChannel}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onDataImported={() => {
          setCategories(loadCategories());
          setLeads(loadLeads());
          setTemplates(loadTemplates());
          setSettings(loadSettings());
        }}
      />

      {/* Offline connectivity indicator */}
      <OfflineIndicator />
    </div>
  );
}
