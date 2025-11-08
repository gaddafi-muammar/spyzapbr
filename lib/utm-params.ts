// /lib/utm-params.ts

// Lista dos parâmetros UTM que queremos rastrear
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

/**
 * Pega os parâmetros UTM da URL atual e os salva no localStorage.
 * Deve ser chamada na primeira página que o usuário visita (landing page).
 */
export const saveUTMParams = (): void => {
  // Garante que o código só rode no navegador
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utm_data: { [key: string]: string } = {};
  
  UTM_PARAMS.forEach((param) => {
    if (params.has(param)) {
      utm_data[param] = params.get(param)!;
    }
  });

  // Salva apenas se algum parâmetro UTM foi encontrado
  if (Object.keys(utm_data).length > 0) {
    localStorage.setItem("utm_params", JSON.stringify(utm_data));
  }
};

/**
 * Recupera os parâmetros UTM salvos do localStorage.
 * Útil na página de checkout para enviar os dados para a API.
 */
export const getUTMParams = (): { [key: string]: string } => {
  if (typeof window === "undefined") return {};

  const saved_params = localStorage.getItem("utm_params");
  if (saved_params) {
    try {
      return JSON.parse(saved_params);
    } catch (e) {
      console.error("Erro ao parsear UTM params do localStorage", e);
      return {};
    }
  }
  return {};
};

/**
 * Constrói uma nova URL com os parâmetros UTM salvos.
 * Essencial para manter os parâmetros ao navegar entre as páginas do funil.
 * @param baseUrl A URL base para a qual navegar (ex: "/step-2")
 */
export const buildUrlWithUTM = (baseUrl: string): string => {
  const utm_params = getUTMParams();
  if (Object.keys(utm_params).length === 0) {
    return baseUrl;
  }

  const new_params = new URLSearchParams(utm_params).toString();
  return `${baseUrl}?${new_params}`;
};


/**
 * Envia os dados UTM para o Google Tag Manager / Data Layer (opcional).
 */
export const pushUTMToDataLayer = (): void => {
    if (typeof window === 'undefined') return;

    const utm_params = getUTMParams();
    if (Object.keys(utm_params).length > 0) {
        // Assegura que window.dataLayer seja um array
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'utm_captured',
            ...utm_params
        });
    }
}
