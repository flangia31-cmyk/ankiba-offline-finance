import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Configuration manquante.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { image } = await req.json()
    if (!image || typeof image !== 'string') {
      return new Response(JSON.stringify({ error: 'Image manquante.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content:
              "Tu es un assistant qui lit les tickets de caisse. Extrais le montant TOTAL payé (le total final), une courte description du commerce/achat, et propose une catégorie parmi: Alimentation, Transport, Shopping, Santé, Loisirs, Logement, Factures, Éducation, Autre. Réponds UNIQUEMENT en JSON: {\"amount\": number, \"description\": string, \"category\": string}. Si tu ne trouves pas de montant, mets amount à 0.",
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Voici la photo du ticket de caisse. Extrais le montant total.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
      }),
    })

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: 'Trop de requêtes, réessayez dans un instant.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: 'Crédits IA épuisés.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!response.ok) {
      const text = await response.text()
      console.error('AI gateway error:', response.status, text)
      return new Response(JSON.stringify({ error: "Échec de l'analyse du ticket." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const match = content.match(/\{[\s\S]*\}/)
    let result = { amount: 0, description: '', category: 'Autre' }
    if (match) {
      try {
        result = { ...result, ...JSON.parse(match[0]) }
      } catch (_) {
        // ignore parse error, return defaults
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('scan-receipt error:', err)
    return new Response(JSON.stringify({ error: 'Erreur serveur.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
