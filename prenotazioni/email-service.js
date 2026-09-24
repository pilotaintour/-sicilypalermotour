/**
 * MODULO AUTONOMO INVIO EMAIL AUTOMATICHE BREVO (ex Sendinblue)
 * Sicily Palermo Tour - Conferma Prenotazioni e Avviso Admin
 */

const BREVO_KEY_STORAGE = 'spt_brevo_api_key';
const ADMIN_NOTIFICATION_EMAIL = 'pilotaintour13@gmail.com';

class BrevoEmailService {
    constructor() {
        this.apiKey = this.getApiKey();
    }

    getApiKey() {
        return localStorage.getItem(BREVO_KEY_STORAGE) || '';
    }

    saveApiKey(key) {
        if (key) {
            localStorage.setItem(BREVO_KEY_STORAGE, key.trim());
            this.apiKey = key.trim();
        }
    }

    // Invia contemporaneamente l'email di conferma al turista e la notifica all'amministratore
    async inviaEmailPrenotazione(bookingData) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.log("Nessuna API Key Brevo configurata. Email non inviata.");
            return { success: false, reason: "API Key mancante" };
        }

        const customerEmail = bookingData.customerEmail;
        const customerName = bookingData.customerName || 'Cliente';
        const code = bookingData.code || '#SPT-BOOK';
        const tourTitle = bookingData.tourTitle || 'Tour Palermo';
        const dateStr = bookingData.dateReadable || bookingData.dateISO || 'N/D';
        const timeStr = bookingData.slotTime || '09:30';
        const total = bookingData.total || '0.00';
        const phone = bookingData.customerPhone || 'N/D';

        // 1. Email di Conferma per il Turista
        const htmlTurista = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; background:#f4f7f9; padding:20px; color:#0f172a;">
                <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
                    <div style="background:linear-gradient(135deg, #0b2545, #134074); padding:25px; text-align:center; color:#ffffff;">
                        <h1 style="margin:0; font-size:1.6rem; font-weight:800;">🏛️ Sicily Palermo Tour</h1>
                        <p style="margin:6px 0 0 0; font-size:0.95rem; opacity:0.9;">Conferma di Prenotazione Ricevuta</p>
                    </div>

                    <div style="padding:28px;">
                        <h2 style="color:#0b2545; margin-top:0;">Grazie ${customerName}!</h2>
                        <p style="font-size:0.95rem; color:#475569; line-height:1.6;">
                            La tua richiesta di prenotazione è stata ricevuta con successo. Di seguito trovi il riepilogo del tuo itinerario a Palermo:
                        </p>

                        <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
                                <span style="color:#64748b; font-weight:bold;">Codice Prenotazione:</span>
                                <strong style="color:#0369a1; font-family:monospace; font-size:1.1rem;">${code}</strong>
                            </div>
                            <div style="margin-bottom:8px;"><strong>📍 Tour:</strong> ${tourTitle}</div>
                            <div style="margin-bottom:8px;"><strong>📅 Data:</strong> ${dateStr}</div>
                            <div style="margin-bottom:8px;"><strong>⏰ Orario Partenza:</strong> ${timeStr}</div>
                            <div style="margin-bottom:8px;"><strong>👥 Partecipanti:</strong> ${bookingData.adults} Adulti${bookingData.children > 0 ? `, ${bookingData.children} Bambini` : ''}</div>
                            <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #cbd5e1; font-size:1.2rem; font-weight:bold; color:#0b2545;">
                                Totale: €${total}
                            </div>
                        </div>

                        <p style="font-size:0.9rem; color:#64748b; line-height:1.5;">
                            In caso di domande o modifiche, puoi contattarci direttamente via WhatsApp al nostro numero ufficiale o rispondere a questa email.
                        </p>

                        <div style="margin-top:25px; text-align:center;">
                            <a href="https://wa.me/393401234567" style="background:#25d366; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:10px; font-weight:bold; display:inline-block;">💬 Contattaci su WhatsApp</a>
                        </div>
                    </div>

                    <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:0.8rem; color:#64748b; border-top:1px solid #e2e8f0;">
                        Sicily Palermo Tour - La tua guida speciale a Palermo
                    </div>
                </div>
            </body>
            </html>
        `;

        // 2. Email di Notifica per l'Amministratore
        const htmlAdmin = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family:sans-serif; padding:20px; color:#1e293b;">
                <h2>🚨 Nuova Prenotazione Ricevuta!</h2>
                <p><strong>Codice:</strong> ${code}</p>
                <p><strong>Tour:</strong> ${tourTitle}</p>
                <p><strong>Data & Ora:</strong> ${dateStr} - Ore ${timeStr}</p>
                <p><strong>Cliente:</strong> ${customerName} (Email: ${customerEmail} | Tel: ${phone})</p>
                <p><strong>Ospiti:</strong> ${bookingData.adults} Adulti, ${bookingData.children || 0} Bambini</p>
                <p><strong>Totale:</strong> €${total}</p>
                <hr>
                <p><a href="https://pilotaintour.github.io/-sicilypalermotour/admin/index.html">Accedi al Pannello Admin per gestire la prenotazione →</a></p>
            </body>
            </html>
        `;

        try {
            // Chiamata API Brevo v3
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: "Sicily Palermo Tour", email: ADMIN_NOTIFICATION_EMAIL },
                    to: [
                        { email: customerEmail, name: customerName },
                        { email: ADMIN_NOTIFICATION_EMAIL, name: "Admin Palermo Tour" }
                    ],
                    subject: `[Conferma Prenotazione] ${tourTitle} - Codice ${code}`,
                    htmlContent: htmlTurista
                })
            });

            if (response.ok) {
                console.log("Email inviata con successo via Brevo!");
                return { success: true };
            } else {
                const errData = await response.json();
                console.error("Errore risposta Brevo:", errData);
                return { success: false, error: errData };
            }
        } catch (e) {
            console.error("Errore durante l'invio dell'email via Brevo:", e);
            return { success: false, error: e };
        }
    }
}

// Istanza globale del servizio email
window.brevoEmailService = new BrevoEmailService();
