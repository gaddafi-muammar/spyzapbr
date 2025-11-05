// src/app/api/check-status/[transaction_id]/route.ts

import { NextResponse } from 'next/server';
import { getPaymentStatus } from '../../webhook/route'; // Importa a função do nosso webhook

export async function GET(
  request: Request,
  { params }: { params: { transaction_id: string } }
) {
  try {
    const transactionId = params.transaction_id;

    if (!transactionId) {
      return NextResponse.json({ error: 'ID da transação não fornecido' }, { status: 400 });
    }

    // Consulta o status (que foi atualizado pelo webhook)
    const status = getPaymentStatus(transactionId);
    
    return NextResponse.json({ status: status });

  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
