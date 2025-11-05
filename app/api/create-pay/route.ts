// src/app/api/create-payment/route.ts

import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Mapeamento de preços no back-end para segurança
const prices = {
  base: 47.0,
  whats: 37.9,
  insta: 17.0,
  facebook: 17.0,
  gps: 7.0,
}

export async function POST(request: Request) {
  try {
    const { selectedBumps, customer } = await request.json()

    if (!customer || !customer.name || !customer.email || !customer.document) {
      return NextResponse.json({ error: "Dados do cliente incompletos." }, { status: 400 })
    }

    let totalAmount = prices.base
    const items = [
      {
        id: "relatorio-principal",
        title: "Relatório Completo SigiloX",
        description: "Acesso completo ao relatório de investigação.",
        price: prices.base,
        quantity: 1,
        is_physical: false,
      },
    ]

    for (const bumpId of selectedBumps) {
      const price = prices[bumpId as keyof typeof prices]
      if (price) {
        totalAmount += price
        items.push({
          id: bumpId,
          title: `${bumpId.charAt(0).toUpperCase() + bumpId.slice(1)} Check`,
          description: `Ferramenta adicional de espionagem.`,
          price: price,
          quantity: 1,
          is_physical: false,
        })
      }
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1"

    const customerData: any = {
      name: customer.name,
      email: customer.email,
      document_type: "CPF",
      document: customer.document,
    }

    if (customer.utm_source) customerData.utm_source = customer.utm_source
    if (customer.utm_medium) customerData.utm_medium = customer.utm_medium
    if (customer.utm_campaign) customerData.utm_campaign = customer.utm_campaign
    if (customer.utm_content) customerData.utm_content = customer.utm_content
    if (customer.utm_term) customerData.utm_term = customer.utm_term

    const liraPayPayload = {
      external_id: uuidv4(),
      total_amount: Number.parseFloat(totalAmount.toFixed(2)),
      payment_method: "PIX",
      webhook_url: "https://tinderchecks.online/api/webhook",
      items: items,
      ip: ip,
      customer: customerData, // Usando o objeto customer com UTMs
    }

    console.log("[v0] LiraPay payload with UTMs:", JSON.stringify(liraPayPayload, null, 2))

    const response = await fetch("https://api.lirapaybr.com/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": `${process.env.LIRAPAY_API_KEY}`,
      },
      body: JSON.stringify(liraPayPayload),
    })

    const data = await response.json()

    if (!response.ok || data.hasError) {
      console.error("Erro retornado pela LiraPay:", data)
      return NextResponse.json(
        { error: "Falha ao criar a transação na LiraPay", details: data.error || data },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro interno do servidor ao processar pagamento:", error)
    return NextResponse.json({ error: "Ocorreu um erro inesperado no servidor." }, { status: 500 })
  }
}
