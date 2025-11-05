// /app/api/payment-status/route.ts

import { NextResponse } from "next/server";
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get('transactionId');

  if (!transactionId) {
    return NextResponse.json({ error: "ID da transação ausente" }, { status: 400 });
  }

  try {
    // ================================================================
    // AQUI VOCÊ CONSULTA O SEU BANCO DE DADOS
    // ================================================================
    // O webhook (Parte 1) é responsável por atualizar o status aqui.
    // Esta rota apenas LÊ o status atual.
    
    // Exemplo:
    // const order = await database.orders.findUnique({ where: { id: transactionId } });
    
    // Para simular, vamos fingir que encontramos a encomenda
    const order = { status: "PENDING" }; // ou "PAID" se o webhook já rodou

    if (!order) {
      return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
    }

    // Retorne o status atual da encomenda
    return NextResponse.json({ status: order.status });
    // ================================================================

  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
