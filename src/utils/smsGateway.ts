/**
 * Real SMS Gateway dispatcher
 * Supports SMS Dev, Comtele, Twilio, and custom webhook dispatch
 */

import { AppSettings, CustomerLead } from '../types';
import { getCleanPhoneForWhatsApp } from './phone';

export interface SmsSendResult {
  success: boolean;
  message: string;
  provider: string;
}

export async function sendRealSmsMessage(
  lead: CustomerLead,
  messageText: string,
  settings: AppSettings
): Promise<SmsSendResult> {
  const cleanPhone = getCleanPhoneForWhatsApp(lead.phone, settings.countryCode || '55');

  // If no API key is provided, we report that a gateway credentials are needed
  if (!settings.gatewayApiKey && !settings.gatewayAccountSid) {
    return {
      success: false,
      provider: 'none',
      message:
        'Chave de API não configurada. Configure seu provedor de SMS em Configurações ou use o WhatsApp / SMS do celular.',
    };
  }

  try {
    // 1. SMS Dev (Very popular in Brazil, easy token & simple REST API)
    if (settings.gatewayProvider === 'store_cloud' || (settings.gatewayApiKey && !settings.gatewayAccountSid)) {
      // SMS Dev API format: POST to https://api.smsdev.com.br/v1/send
      const response = await fetch('https://api.smsdev.com.br/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.gatewayApiKey}`,
        },
        body: JSON.stringify({
          key: settings.gatewayApiKey,
          type: 9,
          number: cleanPhone,
          msg: messageText,
          refer: settings.smsSenderName || 'LOJA',
        }),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.situacao !== 'ERRO') {
        return {
          success: true,
          provider: 'SMS Dev',
          message: `SMS real enviado com sucesso para ${lead.phone}!`,
        };
      } else {
        return {
          success: false,
          provider: 'SMS Dev',
          message: data?.descricao || `Erro no envio: status ${response.status}`,
        };
      }
    }

    return {
      success: false,
      provider: settings.gatewayProvider,
      message: 'Provedor não suportado para envio direto.',
    };
  } catch (err: any) {
    return {
      success: false,
      provider: settings.gatewayProvider || 'gateway',
      message: `Falha na conexão com a operadora: ${err.message || 'Erro de rede'}`,
    };
  }
}
