"use client"

import { useEffect, useState } from "react"
import { X, Lock, CheckCheck, MapPin, AlertTriangle } from "lucide-react"
import Image from "next/image"

// Componente do mapa que agora recebe a localização via props para ser dinâmico.
const RealtimeMap = ({ lat, lng, city, country }: { lat: number; lng: number; city: string; country: string }) => {
  // Constrói a URL do Google Maps com as coordenadas recebidas.
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
          {/* Exibe a localização dinâmica recebida pelas props */}
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

// Define a estrutura de uma mensagem individual.
type Message = {
  type: "incoming" | "outgoing"
  content: string
  time: string
  isBlocked?: boolean
}

// Componente do Popup do Chat (sem alterações necessárias).
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
        {/* Header */}
        <div className="bg-teal-600 text-white p-3 flex items-center gap-3">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-teal-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={
                profilePhoto ||
                "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=" ||
                "/placeholder.svg"
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

        {/* Corpo do Chat */}
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

        {/* Rodapé */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-center bg-gradient-to-t from-white via-white/95 to-transparent">
          <p className="text-gray-700 font-medium">Para ver a conversa completa, você precisa desbloquear os chats.</p>
        </div>
      </div>
    </div>
  )
}

// Componente principal da página.
export default function Step4Male() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [selectedConvoIndex, setSelectedConvoIndex] = useState<number | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string; country: string } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  const defaultLocation = {
    lat: -23.5505,
    lng: -46.6333,
    city: "São Paulo",
    country: "Brasil",
  }

  // Bloco useEffect corrigido para usar a API Route interna.
  useEffect(() => {
    const storedPhoto = localStorage.getItem("profilePhoto")
    setProfilePhoto(
      storedPhoto ||
        "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
    )

    const fetchLocation = async () => {
      try {
        // =======================================================
        //     MUDANÇA PRINCIPAL AQUI
        // Chamando a nossa própria API Route em vez da externa.
        // =======================================================
        const response = await fetch("/api/location")

        if (!response.ok) {
          throw new Error(`A resposta da nossa API interna não foi ok. Status: ${response.status}`)
        }

        const data = await response.json()

        // A lógica de tratamento dos dados permanece a mesma, pois nossa API
        // repassa os dados da ip-api.com.
        if (data.lat && data.lon) {
          setLocation({
            lat: data.lat,
            lng: data.lon,
            city: data.city,
            country: data.country,
          })
        } else {
          console.warn("API interna não retornou os dados esperados.", data.error)
          setLocation(defaultLocation)
        }
      } catch (error) {
        console.error("Falha ao buscar localização da API interna:", error)
        setLocation(defaultLocation)
      } finally {
        setIsLoadingLocation(false)
      }
    }

    fetchLocation()
  }, []) // O array vazio assegura que isso execute apenas uma vez.

  // --- Seus dados estáticos (traduzidos) ---
  const maleImages = [
    "/images/male/4.png",
    "/images/male/7.png",
    "/images/male/6.png",
    "/images/male/5.png",
    "/images/male/9.png",
    "/images/male/8.png",
  ]

  const conversations = [
    {
      img: "/images/male/3.png",
      name: "Bloqueado 🔒",
      msg: "Mensagem deletada recuperada",
      time: "Ontem",
      popupName: "Bloqueado 🔒",
      chatData: [
        { type: "incoming", content: "Oi, como você está?", time: "14:38" },
        { type: "outgoing", content: "Estou bem, e você?", time: "14:40" },
        { type: "incoming", content: "Conteúdo bloqueado", time: "14:43", isBlocked: true },
        { type: "outgoing", content: "Conteúdo bloqueado", time: "14:43", isBlocked: true },
      ] as Message[],
    },
    {
      img: "/images/male/303.png",
      name: "Bloqueado 🔒",
      msg: "Áudio suspeito detectado",
      time: "2 dias atrás",
      popupName: "Bloqueado",
      chatData: [
        { type: "incoming", content: "Oi meu bonito", time: "22:21" },
        { type: "outgoing", content: "Estou aqui, meu amor", time: "22:27" },
        { type: "incoming", content: "Conteúdo bloqueado", time: "22:29", isBlocked: true },
      ] as Message[],
    },
    {
      img: "/images/male/331.png",
      name: "Bloqueado 🔒",
      msg: "Fotos suspeitas encontradas",
      time: "3 dias atrás",
      popupName: "Bloqueado",
      chatData: [
        { type: "incoming", content: "Oi, como você tem estado?", time: "11:45" },
        { type: "outgoing", content: "Estou bem, obrigado! E você?", time: "11:47" },
        { type: "incoming", content: "Conteúdo bloqueado", time: "11:50", isBlocked: true },
      ] as Message[],
    },
  ]

  const suspiciousKeywords = [
    { word: "Atrevido", count: 13 },
    { word: "Amor", count: 22 },
    { word: "Segredo", count: 7 },
    { word: "Escondido", count: 11 },
    { word: "Não conta", count: 5 },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white text-center py-4">
        <h1 className="text-xl font-bold">Relatório de Acesso WhatsApp do Perfil</h1>
        <p className="text-sm opacity-90">
          Confira abaixo as informações mais relevantes da análise do celular pessoal
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* User Detectado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Usuário detectado</h2>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {profilePhoto && (
                <Image
                  src={profilePhoto || "/placeholder.svg"}
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

        {/* Análise de Conversas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Análise de Conversas</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-red-500">148 conversas suspeitas</span> foram encontradas. O sistema
            recuperou <span className="font-semibold text-orange-500">mensagens deletadas</span>.
          </p>
          <p className="text-xs text-gray-500 mb-4">Toque em uma conversa abaixo para ver detalhes.</p>
          <div className="space-y-3">
            {conversations.map((convo, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedConvoIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                    <Image
                      src={convo.img || "/placeholder.svg"}
                      alt="Perfil"
                      width={32}
                      height={32}
                      className="object-cover h-full w-full"
                    />
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

        {/* Mídia Recuperada */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Mídia Recuperada</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-semibold text-red-500">5 áudios comprometedores</span> e{" "}
            <span className="font-semibold text-red-500">247 fotos deletadas</span> foram encontrados.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {maleImages.map((image, index) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Mídia recuperada ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Palavras-chave Suspeitas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Palavras-chave Suspeitas</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            O sistema verificou <span className="font-semibold text-red-500">4.327 mensagens</span> e identificou várias
            palavras-chave.
          </p>
          <div className="space-y-1">
            {suspiciousKeywords.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-200"
              >
                <span className="text-lg text-gray-800">"{item.word}"</span>
                <div className="flex items-center justify-center w-7 h-7 bg-green-500 rounded-full text-white text-sm font-bold">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Localização Suspeita com Mapa */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Localização Suspeita</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">A localização do dispositivo foi rastreada. Confira abaixo:</p>
          {isLoadingLocation ? (
            <div className="text-center p-10 text-gray-500 h-96 flex items-center justify-center">
              <p>Detectando localização com base na sua conexão...</p>
            </div>
          ) : (
            <RealtimeMap
              lat={location?.lat ?? defaultLocation.lat}
              lng={location?.lng ?? defaultLocation.lng}
              city={location?.city ?? defaultLocation.city}
              country={location?.country ?? defaultLocation.country}
            />
          )}
        </div>

        {/* Display do Celular e Texto de Venda */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src="/images/celulares.webp"
                alt="Telefone"
                width={300}
                height={300}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>Você chegou ao final da sua consulta gratuita.</strong>
            </p>
            <p>
              Nosso sistema de rastreamento por satélite é a tecnologia mais avançada para descobrir o que está
              acontecendo. Mas tem um detalhe: manter os satélites e servidores funcionando 24/7 é caro.
            </p>
            <p>A boa notícia? Você não precisa gastar uma fortuna contratando um detetive particular.</p>
            <p>
              É hora de parar de adivinhar e descobrir a verdade. As respostas estão esperando por você. Clique agora e
              obtenha acesso instantâneo – antes que seja tarde demais!
            </p>
          </div>
        </div>

        {/* Desconto Exclusivo */}
        <div className="bg-[#0A3622] text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center">DESCONTO EXCLUSIVO</h2>
          <div className="text-xl text-red-400 line-through text-center my-2">$97</div>
          <div className="text-4xl font-bold mb-4 text-center">$17</div>
          <div className="space-y-2 text-sm mb-6 text-left">
            <div className="flex items-center gap-4">
              <img src="/images/icone-check.png" alt="Ícone de verificação" className="h-8 w-8" />
              <span>Esta pessoa se comunicou recentemente com 3 pessoas de (IP)</span>
            </div>
            <div className="flex items-center gap-4">
              <img src="/images/icone-check.png" alt="Ícone de verificação" className="h-8 w-8" />
              <span>Nosso AI detectou uma mensagem suspeita</span>
            </div>
            <div className="flex items-center gap-4">
              <img src="/images/icone-check.png" alt="Ícone de verificação" className="h-8 w-8" />
              <span>Foi detectado que esta pessoa visualizou o status do contato ****** 6 vezes hoje</span>
            </div>
            <div className="flex items-center gap-4">
              <img src="/images/icone-check.png" alt="Ícone de verificação" className="h-8 w-8" />
              <span>Foi detectado que esta pessoa arquivou 2 conversas ontem</span>
            </div>
          </div>
          <a
            href="https://pay.hotmart.com/R102720481T?checkoutMode=10"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-[#26d366] py-3 text-lg font-bold text-white text-center shadow-[0_4px_12px_rgba(38,211,102,0.3)] transition duration-150 ease-in-out hover:bg-[#22b858] hover:shadow-lg"
          >
            COMPRAR AGORA →
          </a>
        </div>

        {/* Garantia de 30 Dias */}
        <div className="text-center py-8">
          <img src="/images/30en.png" alt="Selo de 30 dias de garantia" className="w-64 h-64 block mx-auto" />
        </div>
      </div>

      {/* Renderização condicional do popup de chat */}
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
