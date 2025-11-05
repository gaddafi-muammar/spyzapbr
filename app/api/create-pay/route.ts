// /app/api/create-pay/route.ts

import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// (Seu objeto de preços e outra lógica permanecem iguais)
const prices = {
  base: 47.0,
  whats: 37.9,
  insta: 17.0,
  facebook: 17.0,
  gps: 7.0,
}

export async function POST(request: Request) {
  try {
    if (!process.env.LIRAPAY_API_KEY) {
      console.error("ERRO CRÍTICO: A variável de ambiente LIRAPAY_API_KEY não está definida.")
      return NextResponse.json(
        { error: "Configuração do servidor incompleta. Chave da API ausente." },
        { status: 500 }
      )
    }

    const { selectedBumps, customer } = await request.json()

    if (!customer || !customer.name || !customer.email || !customer.document) {
      return NextResponse.json({ error: "Dados do cliente incompletos." }, { status: 400 })
    }

    const sanitizedDocument = customer.document.replace(/[^\d]/g, "")
    if (sanitizedDocument.length !== 11) {
      return NextResponse.json({ error: "Formato de CPF inválido." }, { status: 400 })
    }
    
    // ... (Sua lógica de cálculo de preço e montagem de itens continua a mesma) ...
    let totalAmount = prices.base
    const items = [
      { id: "relatorio-principal", title: "Relatório Completo SigiloX", description: "Acesso completo ao relatório de investigação.", price: prices.base, quantity: 1, is_physical: false, },
    ]
    for (const bumpId of selectedBumps) {
      const price = prices[bumpId as keyof typeof prices];
      if (price) {
        totalAmount += price
        items.push({ id: bumpId, title: `${bumpId.charAt(0).toUpperCase() + bumpId.slice(1)} Check`, description: `Ferramenta adicional de espionagem.`, price: price, quantity: 1, is_physical: false, })
      }
    }
    // ====================================================================================

    // --- CORREÇÃO PRINCIPAL E DEFINITIVA ---
    // Ajustando o objeto do cliente para corresponder exatamente ao que a API LiraPay exige.
    const customerData: any = {
      name: customer.name,
      email: customer.email,
      document_type: "CPF",          // <-- ADICIONADO: Campo obrigatório.
      document: sanitizedDocument,   // <-- ALTERADO: O campo agora se chama 'document', não 'cpf'.
    }
    
    const liraPayPayload = {
      external_id: uuidv4(),
      total_amount: Number.parseFloat(totalAmount.toFixed(2)),
      payment_method: "PIX",
      webhook_url: "https://br.securewhatsapponline.site/api/webhook",
      items: items,
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
      customer: customerData, // Usando o objeto corrigido
    }

    console.log("[v0] Enviando payload final para LiraPay:", JSON.stringify(liraPayPayload, null, 2))

    const response = await fetch("https://api.lirapaybr.com/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": process.env.LIRAPAY_API_KEY,
      },
      body: JSON.stringify(liraPayPayload),
    })

    const data = await response.json()

    if (!response.ok || data.hasError) {
      console.error("Erro retornado pela LiraPay:", data)
      return NextResponse.json(
        { error: "Falha ao criar a transação na LiraPay", details: data.errorFields?.join(', ') || data.error || data },
        { status: response.status },
      )
    }

    return NextResponse.json(data)

  } catch (error: any) {
    console.error("ERRO INESPERADO NA API /create-pay:", error)
    return NextResponse.json(
        { 
            error: "Ocorreu um erro inesperado no servidor.",
            details: error.message || "Sem detalhes adicionais."
        }, 
        { status: 500 }
    )
  }
}
