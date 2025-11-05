// src/app/api/webhook/route.ts

import { NextResponse } from 'next/server';

// ATENÇÃO: ISTO É UMA SIMULAÇÃO EM MEMÓRIA. NÃO USE EM PRODUÇÃO REAL!
// Em produção, use um banco de dados (Redis, Vercel KV, PostgreSQL, etc.)
let paymentStatuses: Record<string, string> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Lembre-se de validar a assinatura do webhook aqui por segurança!
    // A documentação da LiraPay deve explicar como fazer isso.

    const transactionId = body.id; // ou body.external_id, dependendo do que você preferir usar
    const status = body.status;

    if (transactionId && status) {
      console.log(`Webhook recebido: Transação ${transactionId} está com status ${status}`);
      
      // Se o pagamento foi autorizado, atualize o status
      if (status === "AUTHORIZED") {
        // Salve o status no seu banco de dados
        paymentStatuses[transactionId] = "PAID";

        // AQUI VOCÊ DEVE:
        // 1. Liberar o acesso do cliente ao produto.
        // 2. Enviar o e-mail de confirmação com o link do relatório.
      }
    }

    // Responda para a LiraPay que você recebeu o webhook com sucesso
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// Esta função será usada pela nossa rota de verificação de status
export function getPaymentStatus(transactionId: string): string {
    return paymentStatuses[transactionId] || "PENDING";
}
