// Conversion de devises en ligne (cours mondiaux temps réel)
// API gratuite, sans clé, CORS activé : https://www.exchangerate-api.com

export interface RateResult {
  rate: number;
  updatedAt: string;
}

/**
 * Récupère le taux de change entre deux devises via les cours mondiaux.
 * @throws si hors ligne ou si la devise n'est pas supportée.
 */
export async function fetchExchangeRate(from: string, to: string): Promise<RateResult> {
  if (from === to) {
    return { rate: 1, updatedAt: new Date().toISOString() };
  }

  const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`);
  if (!res.ok) {
    throw new Error("Impossible de récupérer les taux de change. Vérifiez votre connexion.");
  }

  const data = await res.json();
  if (data.result !== "success" || !data.rates) {
    throw new Error("Le service de taux de change est indisponible pour le moment.");
  }

  const rate = data.rates[to];
  if (typeof rate !== "number") {
    throw new Error(`La devise ${to} n'est pas prise en charge par le service de conversion.`);
  }

  return { rate, updatedAt: data.time_last_update_utc || new Date().toISOString() };
}
