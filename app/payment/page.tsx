// app/payment/page.tsx

"use client"

import { useSearchParams, useRouter } from "next/navigation" // Importe useRouter
import { Suspense, useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Check, Copy } from "lucide-react"
import Image from "next/image"

// Componente principal que faz a lógica
function PaymentScreen() {
  const router = useRouter() // Inicialize o router
  const searchParams = useSearchParams()
  const [pixPayload, setPixPayload] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null) // Novo estado para o ID
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    // Pega ambos os parâmetros da URL
    const payload = searchParams.get("copyPaste")
    const id = searchParams.get("transactionId")
    setPixPayload(payload)
    setTransactionId(id)
  }, [searchParams])


  // --- LÓGICA DE POLLING ACRESCENTADA ---
  useEffect(() => {
    // Só comece a verificar se tivermos um ID de transação
    if (!transactionId) return;

    // Define um intervalo para verificar o status a cada 5 segundos
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment-status?transactionId=${transactionId}`);
        const data = await response.json();

        console.log(`[v0] Verificando status... Status atual: ${data.status}`);

        // SE O PAGAMENTO FOI CONFIRMADO
        if (data.status === "PAID") {
          clearInterval(interval); // Pare de verificar
          router.push("/obrigado"); // Redirecione para a página de obrigado!
        }
      } catch (error) {
        console.error("Erro durante o polling de status:", error);
        // Opcional: parar o polling se houver muitos erros para não sobrecarregar o servidor
      }
    }, 5000); // 5000ms = 5 segundos

    // Limpa o intervalo quando o componente for desmontado (MUITO IMPORTANTE!)
    // Isso evita que a verificação continue rodando mesmo que o usuário saia da página.
    return () => clearInterval(interval);

  }, [transactionId, router]); // Dependências do useEffect


  const handleCopy = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload)
      setIsCopied(true)
      // Volta ao estado normal depois de 2 segundos
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // Se o payload ainda não foi carregado ou não existe
  if (!pixPayload || !transactionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-xl font-bold text-gray-800">Carregando dados de pagamento...</h1>
        <p className="text-gray-600">Se esta página não carregar, por favor volte e tente novamente.</p>
      </div>
    )
  }

  // Tela de pagamento com o QR Code
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 m-4">
      <div className="text-center">
        <Image src="/images/design-mode/pix-icon.png" alt="PIX" width={150} height={150} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Finalize seu Pagamento</h1>
        <p className="text-gray-600 mt-2">
          Abra o aplicativo do seu banco, escolha a opção PIX e escaneie o código QR abaixo.
        </p>
      </div>

      <div className="flex justify-center my-6">
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          <QRCodeCanvas value={pixPayload} size={256} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Se preferir, copie o código abaixo:</p>
        <div className="relative">
          <input
            type="text"
            value={pixPayload}
            readOnly
            className="w-full p-3 pr-12 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleCopy}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-green-600 transition-colors"
          >
            {isCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {isCopied && <p className="text-green-600 text-sm mt-2">Código copiado com sucesso!</p>}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
        <p className="font-semibold text-yellow-800">Aguardando Pagamento</p>
        <p className="text-sm text-yellow-700 mt-1">
          Após o pagamento ser confirmado, esta página será redirecionada automaticamente. Você também receberá o acesso no seu e-mail.
        </p>
      </div>
    </div>
  )
}

// O componente da página que usa Suspense para lidar com a renderização do lado do cliente
export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Suspense fallback={<div>Carregando...</div>}>
        <PaymentScreen />
      </Suspense>
    </div>
  )
}
