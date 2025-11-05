import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BackupEmailRequest {
  email: string;
  backupData: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, backupData }: BackupEmailRequest = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("Sending backup email to:", email);

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ankiba <onboarding@resend.dev>",
        to: [email],
        subject: "Sauvegarde Ankiba - Vos données financières",
        html: `
          <h1>Sauvegarde de vos données Ankiba</h1>
          <p>Bonjour,</p>
          <p>Vous trouverez ci-joint la sauvegarde de vos données financières Ankiba.</p>
          <p><strong>Comment restaurer vos données :</strong></p>
          <ol>
            <li>Ouvrez l'application Ankiba</li>
            <li>Allez dans Profil</li>
            <li>Cliquez sur "Restaurer depuis un fichier"</li>
            <li>Sélectionnez le fichier joint à cet email</li>
          </ol>
          <p>Gardez ce fichier en sécurité, il contient toutes vos informations financières.</p>
          <p>Cordialement,<br>L'équipe Ankiba</p>
        `,
        attachments: [
          {
            filename: `ankiba-backup-${new Date().toISOString().split('T')[0]}.json`,
            content: btoa(backupData),
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-backup-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
