Com certeza! Analisei o seu código e o problema está exatamente alinhado com o que discutimos: a API da LiraPay espera um campo específico para o CPF, e o seu código estava a enviar um nome de campo diferente.
A sua lógica para calcular o preço e montar os itens está perfeita. A correção é pequena, mas crucial.
A API da LiraPay, de acordo com o erro customer.Invalid CPF, espera receber o número do documento do cliente num campo chamado cpf dentro do objeto customer. O seu código estava a enviá-lo como document.
Adicionei também uma melhoria de segurança e robustez: o código agora limpa (sanitiza) o CPF para remover quaisquer máscaras (pontos e traços) que possam vir do frontend. Isso garante que a LiraPay receba sempre apenas os 11 dígitos numéricos.
Rota da API Corrigida (/app/api/create-pay/route.ts)
Aqui está o seu ficheiro completo, com as correções e melhorias aplicadas.
code
TypeScript
// src/app/api/create-pay/route.ts

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

    // Validação dos dados de entrada
    if (!customer || !customer.name || !customer.email || !customer.document) {
      return NextResponse.json(
        { error: "Dados do cliente incompletos." },
        { status: 400 }
      )
    }

    // --- BOA PRÁTICA: Limpar (sanitizar) o CPF ---
    // Remove qualquer formatação como pontos, traços ou espaços
    const sanitizedDocument = customer.document.replace(/[^\d]/g, "")

    // Validação básica do formato do CPF
    if (sanitizedDocument.length !== 11) {
      return NextResponse.json(
        { error: "Formato de CPF inválido." },
        { status: 400 }
      )
    }

    // Cálculo do valor total e montagem dos itens
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

    // --- CORRIGIDO: Montagem do objeto do cliente ---
    // O objeto enviado para a LiraPay deve conter o campo 'cpf'
    const customerData: any = {
      name: customer.name,
      email: customer.email,
      cpf: sanitizedDocument, // <-- CORRIGIDO: O campo deve ser 'cpf' e usar o valor limpo
    }

    // Adiciona parâmetros UTM se existirem
    if (customer.utm_source) customerData.utm_source = customer.utm_source
    if (customer.utm_medium) customerData.utm_medium = customer.utm_medium
    if (customer.utm_campaign) customerData.utm_campaign = customer.utm_campaign
    if (customer.utm_content) customerData.utm_content = customer.utm_content
    if (customer.utm_term) customerData.utm_term = customer.utm_term

    // Montagem do payload final para a LiraPay
    const liraPayPayload = {
      external_id: uuidv4(),
      total_amount: Number.parseFloat(totalAmount.toFixed(2)),
      payment_method: "PIX",
      webhook_url: "https://br.securewhatsapponline.site/api/webhook", // Lembre-se de implementar este webhook
      items: items,
      ip: ip,
      customer: customerData,
    }

    console.log(
      "[v0] LiraPay payload corrigido:",
      JSON.stringify(liraPayPayload, null, 2)
    )

    // Chamada para a API da LiraPay
    const response = await fetch("https://api.lirapaybr.com/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": `${process.env.LIRAPAY_API_KEY}`, // Verifique se o nome do header é 'api-secret' ou 'Authorization'
      },
      body: JSON.stringify(liraPayPayload),
    })

    const data = await response.json()

    // Tratamento robusto da resposta
    if (!response.ok || data.hasError) {
      console.error("Erro retornado pela LiraPay:", data)
      return NextResponse.json(
        {
          error: "Falha ao criar a transação na LiraPay",
          details: data.errorFields || data.error || data,
        },
        { status: response.status }
      )
    }

    // Sucesso! Retorna a resposta completa da LiraPay para o frontend
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro interno do servidor ao processar pagamento:", error)
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado no servidor." },
      { status: 500 }
    )
  }
}
