import { Category, CustomerLead, MessageTemplate, AppSettings } from '../types';

const STORAGE_KEYS = {
  LEADS: 'zapvendedor_leads_v1',
  CATEGORIES: 'zapvendedor_categories_v1',
  SETTINGS: 'zapvendedor_settings_v1',
  TEMPLATES: 'zapvendedor_templates_v1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-mesas',
    name: 'Mesas & Conjuntos',
    color: '#10b981', // Emerald
    description: 'Mesas de jantar, centro e escritório',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-sofas',
    name: 'Sofás & Estofados',
    color: '#3b82f6', // Blue
    description: 'Sofás retráteis, de canto e poltronas',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-cadeiras',
    name: 'Cadeiras & Banquetas',
    color: '#f59e0b', // Amber
    description: 'Cadeiras avulsas e banquetas para balcão',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-armarios',
    name: 'Armários & Roupeiros',
    color: '#8b5cf6', // Violet
    description: 'Guarda-roupas, armários de cozinha e painéis',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-geral',
    name: 'Novidades & Geral',
    color: '#06b6d4', // Cyan
    description: 'Outros produtos e pedidos gerais',
    createdAt: new Date().toISOString(),
  },
];

// Helper to format ISO date YYYY-MM-DD
function getFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export const INITIAL_LEADS: CustomerLead[] = [
  {
    id: 'lead-1',
    name: 'Dona Carla Mendes',
    phone: '(11) 98765-4321',
    product: 'Mesa de Jantar 6 Lugares com tampo de vidro',
    categoryId: 'cat-mesas',
    status: 'waiting',
    priceEstimate: 'R$ 1.800',
    returnDate: getFutureDate(0), // Today!
    notes: 'Pediu para avisar assim que chegar o caminhão com o modelo off-white.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    contactCount: 0,
  },
  {
    id: 'lead-2',
    name: 'Marcos Oliveira',
    phone: '(11) 97654-3210',
    product: 'Mesa Redonda 4 Lugares Madeira Maciça',
    categoryId: 'cat-mesas',
    status: 'waiting',
    priceEstimate: 'R$ 1.250',
    returnDate: getFutureDate(2),
    notes: 'Mora perto da loja, quer vir retirar no mesmo dia.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    contactCount: 0,
  },
  {
    id: 'lead-3',
    name: 'Patrícia Souza',
    phone: '(11) 99123-4567',
    product: 'Sofá Retrátil e Reclinável 3 Lugares Suede Cinza',
    categoryId: 'cat-sofas',
    status: 'waiting',
    priceEstimate: 'R$ 2.400',
    returnDate: getFutureDate(4),
    notes: 'Prefere receber fotos por WhatsApp antes de vir fechar.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    contactCount: 0,
  },
  {
    id: 'lead-4',
    name: 'Roberto Fernandes',
    phone: '(11) 98234-5678',
    product: 'Kit 4 Cadeiras Eames Estofadas Bege',
    categoryId: 'cat-cadeiras',
    status: 'completed',
    priceEstimate: 'R$ 780',
    returnDate: getFutureDate(-2),
    notes: 'Veio na loja, gostou do modelo e comprou à vista no Pix! Venda finalizada com sucesso.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastContactedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    contactCount: 1,
  },
];

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    title: '📦 O produto chegou! (Aviso Principal)',
    body: 'Olá, {nome}! Tudo bem? 😊\n\nBoas notícias: o produto que você estava esperando ({produto}) acabou de chegar aqui na {loja}! 📦✨\n\nJá reservei com prioridade no seu nome. Consegue dar um pulinho aqui na loja hoje ou quer que eu te mande fotos e vídeos agora mesmo?\n\nAtt, {vendedor}',
  },
  {
    id: 'tmpl-2',
    title: '🚚 Previsão de Chegada / A Caminho',
    body: 'Oi, {nome}! Aqui é o {vendedor} da {loja}. Tudo ótimo por aí?\n\nPassando para te avisar que o seu pedido de {produto} tem previsão de entrega confirmada para {data_retorno}. Assim que descarregar no estoque eu já te mando mensagem!\n\nUm grande abraço!',
  },
  {
    id: 'tmpl-3',
    title: '✨ Novidade na Categoria',
    body: 'Olá, {nome}! Tudo bem? 😊\n\nLembrei de você porque acabaram de chegar novidades incríveis na categoria {categoria} aqui na {loja}! 🌟\n\nSe quiser dar uma olhadinha nos modelos e fotos, me avise que te mando por aqui!\n\nAtt, {vendedor}',
  },
  {
    id: 'tmpl-4',
    title: '💬 Mensagem Direta & Rápida',
    body: 'Olá, {nome}! Aqui é o {vendedor} da {loja}. Chegou o produto que você pediu ({produto}). Posso reservar para você vir retirar hoje?',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  sellerName: 'Vendedor',
  storeName: 'Nossa Loja',
  countryCode: '55',
};

// Storage operations
export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories to localStorage', err);
  }
}

export function loadLeads(): CustomerLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) {
      saveLeads(INITIAL_LEADS);
      return INITIAL_LEADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LEADS;
  } catch {
    return INITIAL_LEADS;
  }
}

export function saveLeads(leads: CustomerLead[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  } catch (err) {
    console.error('Error saving leads to localStorage', err);
  }
}

export function loadTemplates(): MessageTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      saveTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: MessageTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (err) {
    console.error('Error saving templates to localStorage', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage', err);
  }
}

/**
 * Exports all app data into a downloadable JSON backup
 */
export function exportBackupData(): string {
  const data = {
    app: 'ZapVendedor',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    categories: loadCategories(),
    leads: loadLeads(),
    templates: loadTemplates(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Imports backup data into localStorage
 */
export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (!parsed.categories && !parsed.leads)) {
      return { success: false, message: 'Arquivo de backup inválido.' };
    }
    if (Array.isArray(parsed.categories)) {
      saveCategories(parsed.categories);
    }
    if (Array.isArray(parsed.leads)) {
      saveLeads(parsed.leads);
    }
    if (Array.isArray(parsed.templates)) {
      saveTemplates(parsed.templates);
    }
    if (parsed.settings) {
      saveSettings(parsed.settings);
    }
    return { success: true, message: 'Dados restaurados com sucesso!' };
  } catch {
    return { success: false, message: 'Erro ao processar arquivo JSON.' };
  }
}
