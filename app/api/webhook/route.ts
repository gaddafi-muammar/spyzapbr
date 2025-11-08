// /app/api/webhook/route.ts

import { NextResponse } from "next/server"

// IMPORTANTE: Em produção, você deve validar esta requisição para garantir
// que ela realmente veio da LiraPay, usando um segredo compartilhado ou assinatura.
// Por agora, vamos focar na lógica principal.

const paymentStatusMap = new Map<string, string>()

export function getPaymentStatus(transactionId: string): string {
  return paymentStatusMap.get(transactionId) || "PENDING"
}

export function setPaymentStatus(transactionId: string, status: string): void {
  paymentStatusMap.set(transactionId, status)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Webhook recebido:", JSON.stringify(body, null, 2))

    // A LiraPay geralmente envia o status e o ID da transação
    const transactionId = body.external_id
    const paymentStatus = body.status // ex: 'PAID', 'EXPIRED', etc.

    if (!transactionId || !paymentStatus) {
      return NextResponse.json({ error: "Dados do webhook incompletos" }, { status: 400 })
    }

    setPaymentStatus(transactionId, paymentStatus)

    // ===================================================================
    // AQUI É ONDE A SUA LÓGICA DE NEGÓCIO ACONTECE
    // ===================================================================
    if (paymentStatus === "PAID") {
      // 1. Encontre a encomenda no seu banco de dados usando o 'transactionId'
      // Ex: const order = await database.orders.find({ where: { id: transactionId } });

      // 2. Atualize o status da encomenda para "PAGO"
      // Ex: await database.orders.update({ where: { id: transactionId }, data: { status: 'PAID' } });
      console.log(`[v0] Transação ${transactionId} foi paga! Atualizando banco de dados...`)

      // 3. Envie o e-mail de confirmação para o cliente
      // Ex: await sendConfirmationEmail(order.customer.email);
      console.log(`[v0] Enviando e-mail de confirmação...`)

      // 4. Libere o acesso ao produto digital
      // ...sua lógica aqui...
    }
    // ===================================================================

    // Responda à LiraPay com sucesso (status 200) para que ela saiba que você recebeu.
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Erro no processamento do webhook:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
