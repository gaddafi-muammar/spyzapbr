export function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {}

  const searchParams = new URLSearchParams(window.location.search)
  const utmParams: Record<string, string> = {}

  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]

  utmKeys.forEach((key) => {
    const value = searchParams.get(key)
    if (value) {
      utmParams[key] = value
    }
  })

  return utmParams
}

export function saveUTMParams(): void {
  const utmParams = getUTMParams()
  if (Object.keys(utmParams).length > 0) {
    localStorage.setItem("utmParams", JSON.stringify(utmParams))
  }
}

export function getStoredUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {}

  const stored = localStorage.getItem("utmParams")
  return stored ? JSON.parse(stored) : {}
}

export function buildUrlWithUTM(path: string): string {
  const utmParams = getStoredUTMParams()
  const params = new URLSearchParams(utmParams)
  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

export function pushUTMToDataLayer(): void {
  if (typeof window === "undefined") return

  const utmParams = getStoredUTMParams()

  if (Object.keys(utmParams).length > 0) {
    if ((window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: "page_view",
        utm_source: utmParams.utm_source || undefined,
        utm_medium: utmParams.utm_medium || undefined,
        utm_campaign: utmParams.utm_campaign || undefined,
        utm_term: utmParams.utm_term || undefined,
        utm_content: utmParams.utm_content || undefined,
      })
    }
  }
}
