/**
 * Formats a Brazilian or international phone number
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // Landline: (11) 1234-5678
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Mobile with 9 digits: (11) 91234-5678
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Normalizes phone number into an international format ready for WhatsApp API
 * Defaults to Brazil (+55) if standard 10 or 11 digits
 */
export function getCleanPhoneForWhatsApp(phone: string, defaultCountryCode = '55'): string {
  let digits = phone.replace(/\D/g, '');

  // If starts with 0, remove it (e.g. 0119...)
  if (digits.startsWith('0') && digits.length >= 11) {
    digits = digits.slice(1);
  }

  // If 10 or 11 digits, assume Brazilian local DDD number
  if (digits.length === 10 || digits.length === 11) {
    return `${defaultCountryCode}${digits}`;
  }

  // If already includes 55 and has 12 or 13 digits
  if (digits.startsWith(defaultCountryCode) && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  return digits;
}

/**
 * Builds a direct WhatsApp click-to-chat URL
 */
export function buildWhatsAppUrl(phone: string, message: string, defaultCountryCode = '55'): string {
  const cleanPhone = getCleanPhoneForWhatsApp(phone, defaultCountryCode);
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

/**
 * Builds a native SMS link for mobile devices.
 * Supports multiple recipients at once in native Messages app!
 */
export function buildSmsUrl(
  phones: string | string[],
  message: string,
  defaultCountryCode = '55'
): string {
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

  const phoneArray = Array.isArray(phones) ? phones : [phones];
  const cleanList = phoneArray
    .map((p) => getCleanPhoneForWhatsApp(p, defaultCountryCode))
    .filter(Boolean);

  const delimiter = isIOS ? ';' : ',';
  const recipientStr = cleanList.join(delimiter);
  const encodedMsg = encodeURIComponent(message);

  // iOS uses &body= while Android uses ?body=
  const separator = isIOS ? '&' : '?';
  return `sms:${recipientStr}${separator}body=${encodedMsg}`;
}


/**
 * Calculates human-readable status for a return date
 */
export function getReturnDateInfo(returnDateStr?: string): {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  colorClass: string;
} {
  if (!returnDateStr) {
    return {
      text: 'Sem data de retorno',
      isOverdue: false,
      isToday: false,
      isUpcoming: false,
      colorClass: 'text-slate-400 bg-slate-800/60 border-slate-700/60',
    };
  }

  // Parse YYYY-MM-DD in local time
  const [year, month, day] = returnDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays === 1 ? 'Atrasado 1 dia' : `Atrasado ${overdueDays} dias`,
      isOverdue: true,
      isToday: false,
      isUpcoming: false,
      colorClass: 'text-rose-300 bg-rose-950/80 border-rose-700/60 shadow-xs shadow-rose-900/40',
    };
  }

  if (diffDays === 0) {
    return {
      text: 'Chega hoje! 🔔',
      isOverdue: false,
      isToday: true,
      isUpcoming: false,
      colorClass: 'text-amber-200 bg-amber-950/90 border-amber-500/80 font-semibold animate-pulse shadow-xs shadow-amber-900/50',
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Amanhã',
      isOverdue: false,
      isToday: false,
      isUpcoming: true,
      colorClass: 'text-emerald-300 bg-emerald-950/80 border-emerald-600/60',
    };
  }

  return {
    text: `Em ${diffDays} dias (${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')})`,
    isOverdue: false,
    isToday: false,
    isUpcoming: true,
    colorClass: 'text-blue-300 bg-blue-950/70 border-blue-700/60',
  };
}
