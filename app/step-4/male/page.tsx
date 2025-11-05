"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Lock, CheckCheck, MapPin, AlertTriangle } from "lucide-react"
import Image from "next/image"

// =======================================================
//     Componente RealtimeMap (Sem alterações)
// =======================================================
const RealtimeMap = ({ lat, lng, city, country }: { lat: number; lng: number; city: string; country: string }) => {
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`
  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-inner">
      <iframe
        className="absolute top-0 left-0 w-full h-full border-0"
        loading="lazy"
        allowFullScreen
        src={mapEmbedUrl}
      ></iframe>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="bg-gray-800/80 text-white text-xs font-bold py-1 px-3 rounded">RASTREAMENTO GPS</span>
          <span className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded">AO VIVO</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute h-20 w-20 rounded-full bg-red-600/30 animate-ping"></div>
          <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-red-600 border-2 border-white shadow-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-white">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>ATIVIDADE SUSPEITA DETECTADA</span>
          </div>
          <p className="text-sm text-gray-200">
            Localização: {city}, {country}
          </p>
          <p className="text-sm text-gray-200">
            Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
          <p className="text-xs text-gray-300">O dispositivo foi rastreado para esta área</p>
        </div>
      </div>
    </div>
  )
}

// =======================================================
//     Componente ChatPopup (Sem alterações)
// =======================================================
type Message = {
  type: "incoming" | "outgoing"
  content: string
  time: string
  isBlocked?: boolean
}
const ChatPopup = ({
  onClose,
  profilePhoto,
  conversationData,
  conversationName,
}: {
  onClose: () => void
  profilePhoto: string | null
  conversationData: Message[]
  conversationName: string
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-teal-600 text-white p-3 flex items-center gap-3">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-teal-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={
                profilePhoto ||
                "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
              }
              alt="Perfil"
              width={40}
              height={40}
              className="object-cover h-full w-full"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{conversationName.replace("🔒", "").trim()}</span>
            {conversationName.includes("🔒") && <Lock className="h-4 w-4" />}
          </div>
        </div>
        <div className="bg-gray-200 p-4 space-y-4 h-[28rem] overflow-y-scroll">
          {conversationData.map((msg, index) =>
            msg.type === "incoming" ? (
              <div key={index} className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-[80%] shadow">
                  <p className={`text-sm ${msg.isBlocked ? "font-semibold text-red-500" : "text-gray-800"}`}>
                    {msg.content}
                  </p>
                  <p className="text-right text-xs text-gray-400 mt-1">{msg.time}</p>
                </div>
              </div>
            ) : (
              <div key={index} className="flex justify-end">
                <div className="bg-lime-200 rounded-lg p-3 max-w-[80%] shadow">
                  <p className={`text-sm ${msg.isBlocked ? "font-semibold text-red-500" : "text-gray-800"}`}>
                    {msg.content}
                  </p>
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-xs text-gray-500 mr-1">{msg.time}</span>
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-center bg-gradient-to-t from-white via-white/95 to-transparent">
          <p className="text-gray-700 font-medium">Para ver a conversa completa, você precisa desbloquear os chats.</p>
        </div>
      </div>
    </div>
  )
}

// =======================================================
//     Componente Principal Step4Male
// =======================================================
export default function Step4Male() {
  const router = useRouter()
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [selectedConvoIndex, setSelectedConvoIndex] = useState<number | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string; country: string } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [selectedBumps, setSelectedBumps] = useState<string[]>([])
  const [formData, setFormData] = useState({ name: "", email: "", document: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useState("")

  const defaultLocation = { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brasil" }

  useEffect(() => {
    const storedPhoto = localStorage.getItem("profilePhoto")
    setProfilePhoto(
      storedPhoto ||
        "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
    )

    const fetchLocation = async () => {
      try {
        const response = await fetch("/api/location")
        if (!response.ok) throw new Error("API response not ok")
        const data = await response.json()
        if (data.lat && data.lon) {
          setLocation({ lat: data.lat, lng: data.lon, city: data.city, country: data.country })
        } else {
          setLocation(defaultLocation)
        }
      } catch (error) {
        setLocation(defaultLocation)
      } finally {
        setIsLoadingLocation(false)
      }
    }
    fetchLocation()
  }, [])

  const maleImages = [
    "/images/male/4.png", "/images/male/7.png", "/images/male/6.png",
    "/images/male/5.png", "/images/male/9.png", "/images/male/8.png",
  ]
  const conversations = [
    {
      img: "/images/male/3.png", name: "Bloqueado 🔒", msg: "Mensagem deletada recuperada", time: "Ontem", popupName: "Bloqueado 🔒",
      chatData: [{ type: "incoming", content: "Conteúdo bloqueado", time: "14:43", isBlocked: true }] as Message[],
    },
    {
      img: "/images/male/303.png", name: "Bloqueado 🔒", msg: "Áudio suspeito detectado", time: "2 dias atrás", popupName: "Bloqueado",
      chatData: [{ type: "incoming", content: "Conteúdo bloqueado", time: "22:29", isBlocked: true }] as Message[],
    },
    {
      img: "/images/male/331.png", name: "Bloqueado 🔒", msg: "Fotos suspeitas encontradas", time: "3 dias atrás", popupName: "Bloqueado",
      chatData: [{ type: "incoming", content: "Conteúdo bloqueado", time: "11:50", isBlocked: true }] as Message[],
    },
  ]
  const suspiciousKeywords = [
    { word: "Atrevido", count: 13 }, { word: "Amor", count: 22 }, { word: "Segredo", count: 7 },
    { word: "Escondido", count: 11 }, { word: "Não conta", count: 5 },
  ]
  
  const orderBumps = [
    { id: "whats", title: "Modo Restaurador", description: "Você pode restaurar todas as mensagens, fotos e vídeos apagados dos últimos 90 dias...", price: 37.0, icon: "/images/whatsapp-icon.png", },
    { id: "insta", title: "Insta Check", description: "Com apenas o @perfil do Instagram... espie todas as conversas em tempo real.", price: 17.0, icon: "/images/instagram-icon.png", },
    { id: "facebook", title: "Facebook Check", description: "Espionagem em tempo real no Facebook e Messenger...", price: 17.0, icon: "/images/facebook-icon.png", },
    { id: "gps", title: "GPS Check", description: "Rastreie a localização da pessoa desejada 24 horas por dia via GPS.", price: 7.0, icon: "/images/gps-icon.png", },
  ]

  const toggleBump = (bumpId: string) => {
    setSelectedBumps((prev) => (prev.includes(bumpId) ? prev.filter((id) => id !== bumpId) : [...prev, bumpId]))
  }

  const calculateTotal = () => {
    let total = 47.0
    selectedBumps.forEach((bumpId) => {
      const bump = orderBumps.find((b) => b.id === bumpId)
      if (bump) total += bump.price
    })
    return total.toFixed(2).replace(".", ",")
  }

  // =======================================================
  //     FUNÇÃO DE PAGAMENTO COM A MUDANÇA
  // =======================================================
  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.document) {
      setPaymentError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/create-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedBumps: selectedBumps,
          customer: { name: formData.name, email: formData.email, document: formData.document },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.hasError) {
        const errorMessage = data.details || data.error || "Ocorreu um erro desconhecido.";
        throw new Error(errorMessage);
      }
      
      const pixPayload = data.pix?.payload;
      const transactionId = data.transactionId; // <-- CAPTURA O ID

      if (pixPayload && transactionId) {
        // --- MUDANÇA APLICADA AQUI ---
        // Adiciona o transactionId aos parâmetros da URL
        const params = new URLSearchParams({ 
          copyPaste: pixPayload,
          transactionId: transactionId,
        });
        router.push(`/payment?${params.toString()}`);
      } else {
        throw new Error("Dados essenciais para o pagamento não foram recebidos.");
      }
    } catch (error: any) {
      console.error("[v0] Erro ao processar pagamento:", error);
      setPaymentError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-500 text-white text-center py-4">
        <h1 className="text-xl font-bold">Relatório de Acesso WhatsApp do Perfil</h1>
        <p className="text-sm opacity-90">Confira abaixo as informações mais relevantes da análise</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Usuário detectado</h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {profilePhoto && (
                <Image
                  src={profilePhoto}
                  alt="Perfil WhatsApp"
                  width={80}
                  height={80}
                  className="object-cover h-full w-full"
                  unoptimized
                />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Análise de Conversas</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-red-500">148 conversas suspeitas</span> foram encontradas...
          </p>
          <div className="space-y-3">
            {conversations.map((convo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedConvoIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image src={convo.img} alt={convo.name} width={32} height={32} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{convo.name}</p>
                    <p className="text-xs text-gray-500">{convo.msg}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{convo.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800">Mídia Recuperada</h2>
          <div className="grid grid-cols-3 gap-3">
            {maleImages.map((image, index) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                <Image src={image} alt={`Mídia recuperada ${index + 1}`} fill className="object-cover"/>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800">Palavras-chave Suspeitas</h2>
          <div className="space-y-1">
            {suspiciousKeywords.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-200">
                <span className="text-lg text-gray-800">"{item.word}"</span>
                <div className="flex items-center justify-center w-7 h-7 bg-green-500 rounded-full text-white text-sm font-bold">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800">Localização Suspeita</h2>
          {isLoadingLocation ? (
            <p>Carregando mapa...</p>
          ) : (
            <RealtimeMap
              lat={location?.lat ?? defaultLocation.lat}
              lng={location?.lng ?? defaultLocation.lng}
              city={location?.city ?? defaultLocation.city}
              country={location?.country ?? defaultLocation.country}
            />
          )}
        </div>

        <div className="bg-[#0A3622] text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center">DESCONTO EXCLUSIVO</h2>
          <div className="text-xl text-red-400 line-through text-center my-2">R$197</div>
          <div className="text-4xl font-bold mb-4 text-center">R$47</div>

          <h3 className="text-lg font-bold mb-4 text-center">Turbine Sua Investigação (Opcional)</h3>
          <div className="relative mb-6">
            <div className="absolute left-5 top-0 h-full w-0.5 -translate-x-1/2 bg-white/20"></div>
            {orderBumps.map((bump) => (
              <label key={bump.id} className="grid grid-cols-[auto,1fr] items-start gap-4 py-3 cursor-pointer">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#0A3622]">
                  <Image src={bump.icon} alt={bump.title} width={32} height={32} />
                </div>
                <div className="pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBumps.includes(bump.id)}
                        onChange={() => toggleBump(bump.id)}
                        className="h-5 w-5 accent-green-500"
                      />
                      <span className="font-semibold">{bump.title}</span>
                    </div>
                    <span className="ml-4 font-bold text-green-400">+ R${bump.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <p className="pl-[32px] pt-1 text-sm text-white/70">{bump.description}</p>
                </div>
              </label>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4 text-center">Dados para Pagamento</h3>
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded text-gray-800"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 rounded text-gray-800"
            />
            <input
              type="text"
              placeholder="CPF"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              className="w-full p-2 rounded text-gray-800"
            />
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center text-white">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">R${calculateTotal()}</span>
            </div>
          </div>

          {paymentError && <div className="bg-red-500/20 p-3 mb-4 text-red-200">{paymentError}</div>}

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full rounded-full bg-[#26d366] py-3 text-lg font-bold text-white disabled:opacity-50"
          >
            {isLoading ? "Processando..." : "PAGAR COM PIX E DESBLOQUEAR TUDO"}
          </button>
        </div>
      </div>

      {selectedConvoIndex !== null && (
        <ChatPopup
          onClose={() => setSelectedConvoIndex(null)}
          profilePhoto={conversations[selectedConvoIndex].img}
          conversationData={conversations[selectedConvoIndex].chatData}
          conversationName={conversations[selectedConvoIndex].popupName}
        />
      )}
    </div>
  )
}
