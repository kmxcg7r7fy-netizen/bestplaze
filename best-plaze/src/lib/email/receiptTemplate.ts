import type { ReservationRow } from "@/types/reservation";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function buildReceiptEmail(r: ReservationRow): { subject: string; html: string } {
  const subject = `Votre demande de réservation a bien été reçue — XI BestPlaze`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Demande de réservation reçue</title>
</head>
<body style="margin:0;padding:0;background:#070709;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070709;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo / marque -->
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#d8b05a;letter-spacing:0.04em;">XI BestPlaze</p>
              <p style="margin:4px 0 0 0;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:rgba(255,255,255,0.45);">Lounge · Tours</p>
            </td>
          </tr>

          <!-- Carte principale -->
          <tr>
            <td style="background:#0e0e12;border:1px solid rgba(216,176,90,0.20);border-radius:20px;overflow:hidden;">

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,rgba(216,176,90,0.12),rgba(216,176,90,0.04));padding:32px 32px 28px;text-align:center;border-bottom:1px solid rgba(216,176,90,0.12);">
                    <div style="display:inline-block;background:rgba(216,176,90,0.15);border:1px solid rgba(216,176,90,0.30);border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:24px;margin-bottom:16px;">📬</div>
                    <p style="margin:0;font-size:24px;font-weight:700;color:#f1d28a;line-height:1.2;">Demande bien reçue !</p>
                    <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.70);">Bonjour ${r.prenom}, nous avons bien reçu votre demande de réservation.</p>
                    <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.50);">Notre équipe l'examinera et vous recontactera si nécessaire.</p>
                  </td>
                </tr>
              </table>

              <!-- Détails réservation -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 20px;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:rgba(255,255,255,0.45);">Récapitulatif de votre demande</p>

                    <!-- Ligne date -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td style="padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.45);">Date</p>
                                <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:rgba(255,255,255,0.92);">${formatDate(r.date_reservation)}</p>
                              </td>
                              <td width="50%">
                                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.45);">Heure</p>
                                <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:rgba(255,255,255,0.92);">${r.heure}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Ligne espace / personnes -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td style="padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.45);">Espace</p>
                                <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:rgba(255,255,255,0.92);">${r.espace}</p>
                              </td>
                              <td width="50%">
                                <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(255,255,255,0.45);">Personnes</p>
                                <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:rgba(255,255,255,0.92);">${r.nb_personnes} personne${r.nb_personnes > 1 ? "s" : ""}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${r.occasion ? `
                    <!-- Occasion -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td style="padding:14px 16px;background:rgba(216,176,90,0.06);border:1px solid rgba(216,176,90,0.15);border-radius:12px;">
                          <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:rgba(216,176,90,0.70);">Occasion</p>
                          <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#d8b05a;">${r.occasion}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                  </td>
                </tr>
              </table>

              <!-- Message d'attente -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 32px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:20px 24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;text-align:center;">
                          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.65);">Nous vous enverrons un email de confirmation dès que votre réservation sera validée.</p>
                          <p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.40);">📍 56 Rue de Suède, Tours · Mardi – Samedi · 18h – 2h</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.30);">
                Vous recevez cet email car vous avez effectué une demande de réservation sur bestplaze.fr<br/>
                Pour modifier ou annuler, répondez à cet email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
