"use client"

import { useEffect } from "react"
import { saveUTMParams, getStoredUTMParams } from "@/lib/utm-params"

export default function ObrigadoPage() {
  useEffect(() => {
    saveUTMParams()

    // Empurrar evento de conversão para o GTM com os parâmetros UTM
    const utmParams = getStoredUTMParams()
    if ((window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: "purchase",
        event_category: "conversion",
        event_label: "pagamento_confirmado",
        utm_source: utmParams.utm_source || undefined,
        utm_medium: utmParams.utm_medium || undefined,
        utm_campaign: utmParams.utm_campaign || undefined,
        utm_term: utmParams.utm_term || undefined,
        utm_content: utmParams.utm_content || undefined,
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center max-w-lg mx-4">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Pagamento Confirmado!</h1>
        <p className="text-gray-700 mb-2">Obrigado pela sua compra.</p>
        <p className="text-gray-700 mb-8">
          Enviámos um e-mail para você com os detalhes do seu acesso. Por favor, verifique a sua caixa de entrada e
          spam.
        </p>

        {/* --- BOTÃO ADICIONADO AQUI --- */}
        <a
          href="https://trustsignals.online/index?m=login_required"
          className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition-colors duration-300"
        >
          ACESSAR PAINEL DE CONTROLE
        </a>
      </div>
    </div>
  )
}
