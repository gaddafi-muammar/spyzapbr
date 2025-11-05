"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2, CheckCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProgressStep {
  id: string
  text: string
  status: "pending" | "loading" | "completed"
}

export default function Step3() {
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [location, setLocation] = useState<string>("Detectando localização...")

  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState<number>(1)

  useEffect(() => {
    const storedPhone = localStorage.getItem("phoneNumber")
    const storedPhoto = localStorage.getItem("profilePhoto")

    setPhoneNumber(storedPhone || "Número não encontrado")
    setProfilePhoto(
      storedPhoto ||
        "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
    )

    const fetchLocation = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch("/api/location", {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) throw new Error("Falha ao buscar localização")
        const data = await response.json()

        setLocation(data.city || "Localização Desconhecida")
      } catch (error) {
        console.error("[v0] Location fetch error:", error)
        setLocation("Sua Localização")
      }
    }

    fetchLocation()
  }, [])

  const steps: ProgressStep[] = useMemo(
    () => [
      { id: "initiating", text: "Iniciando conexão com os servidores do WhatsApp...", status: "pending" },
      { id: "locating", text: "Localizando o servidor mais próximo...", status: "pending" },
      { id: "establishing", text: "Servidor localizado! Estabelecendo conexão segura...", status: "pending" },
      { id: "verifying", text: "Verificando número de telefone...", status: "pending" },
      { id: "valid", text: "Número de telefone válido", status: "pending" },
      { id: "analyzing", text: "Analisando banco de dados...", status: "pending" },
      { id: "fetching", text: "Recuperando informações de perfil...", status: "pending" },
      { id: "detecting", text: "Detectando localização do dispositivo...", status: "pending" },
      { id: "suspicious", text: `Atividade suspeita detectada perto de ${location}...`, status: "pending" },
      { id: "preparing", text: "Preparando canal de leitura privada...", status: "pending" },
      { id: "established", text: "Canal privado estabelecido!", status: "pending" },
      { id: "synchronizing", text: "Sincronizando mensagens...", status: "pending" },
      { id: "complete", text: "Sincronização completa!", status: "pending" },
      { id: "granted", text: "Acesso concedido com sucesso!", status: "pending" },
    ],
    [location],
  )

  const [currentSteps, setCurrentSteps] = useState<ProgressStep[]>([])

  useEffect(() => {
    if (steps.length > 0 && currentSteps.length === 0) {
      setCurrentSteps(steps.map((step, index) => (index === 0 ? { ...step, status: "loading" } : step)))
    }
  }, [steps, currentSteps.length])

  useEffect(() => {
    if (!steps.length || currentSteps.length === 0) return

    const totalDuration = 33 * 1000
    const stepInterval = totalDuration / steps.length
    const progressInterval = 100

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          setIsCompleted(true)
          return 100
        }
        return prev + 100 / (totalDuration / progressInterval)
      })
    }, progressInterval)

    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const nextIndex = prev + 1
        if (nextIndex < steps.length) {
          setCurrentSteps((current) =>
            current.map((step, index) => {
              if (index < nextIndex) return { ...step, status: "completed" }
              if (index === nextIndex) return { ...step, status: "loading" }
              return step
            }),
          )
          setVisibleSteps(nextIndex + 1)
          return nextIndex
        } else {
          setCurrentSteps((current) => current.map((step) => ({ ...step, status: "completed" })))
          clearInterval(stepTimer)
          return prev
        }
      })
    }, stepInterval)

    return () => {
      clearInterval(progressTimer)
      clearInterval(stepTimer)
    }
  }, [steps, currentSteps.length])

  const handleViewReport = () => {
    const selectedGender = localStorage.getItem("selectedGender") || "male"
    if (selectedGender === "female") {
      router.push("/step-4/female")
    } else {
      router.push("/step-4/male")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-6 pt-2">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 mb-3">
              {profilePhoto ? (
                <Image
                  src={profilePhoto || "/placeholder.svg"}
                  alt="Perfil WhatsApp"
                  width={64}
                  height={64}
                  className="object-cover h-full w-full"
                  unoptimized
                />
              ) : (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">Perfil WhatsApp</h3>
              <p className="text-gray-600 mb-2">{phoneNumber || "Carregando número..."}</p>
              <div className="flex items-center justify-center gap-1.5 text-green-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {!isCompleted ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium text-sm">
                    {currentSteps[currentStepIndex]?.text || "Conectando..."}
                  </span>
                  <span className="text-green-600 font-bold text-sm">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {currentSteps.slice(0, visibleSteps).map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 text-sm transition-all duration-500 ${
                      index < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    <div className="flex-shrink-0 w-4 h-4 mt-0.5">
                      {step.status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : step.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-3.5 w-3.5 mt-px rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    <span
                      className={`transition-colors duration-300 ${
                        step.status === "completed"
                          ? "text-green-600 font-medium"
                          : step.status === "loading"
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                      }`}
                    >
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 border-t border-gray-200 mt-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sincronização Completa!</h3>
              <p className="text-gray-600 mb-6">Seu acesso privado foi estabelecido com sucesso.</p>
              <Button
                onClick={handleViewReport}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-lg font-medium rounded-lg"
              >
                Ver Relatório Completo Agora
              </Button>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full max-w-md text-center py-4 mt-4">
        <div className="flex justify-center space-x-6 text-sm mb-3">
          <Link href="#" className="text-gray-500 hover:text-blue-500">
            Política de Privacidade
          </Link>
          <Link href="#" className="text-gray-500 hover:text-blue-500">
            Termos de Uso
          </Link>
          <Link href="#" className="text-gray-500 hover:text-blue-500">
            Suporte por Email
          </Link>
        </div>
        <p className="text-gray-400 text-xs">© 2025 Proteja Seu Relacionamento. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
