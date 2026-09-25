/**
 * MODULO AUTONOMO INVIO EMAIL AUTOMATICHE BREVO (ex Sendinblue)
 * Sicily Palermo Tour - Conferma Prenotazioni e Avviso Admin con Testi Personalizzati
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

    // Invia un messaggio dal Form Contatti direttamente alla casella dell'amministratore
    async inviaEmailMessaggioContatto(nome, emailCliente, messaggio) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.log("Nessuna API Key Brevo configurata.");
            return { success: false, reason: "API Key mancante" };
        }

        const htmlContatto = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family:sans-serif; padding:20px; color:#1e293b; background:#f8fafc;">
                <div style="max-width:550px; margin:0 auto; background:#ffffff; border-radius:12px; padding:25px; border:1px solid #cbd5e1;">
                    <h2 style="color:#0b2545; margin-top:0;">📩 Nuovo Messaggio dal Form Contatti</h2>
                    <p><strong>Nome Mittente:</strong> ${nome}</p>
                    <p><strong>Email Cliente:</strong> ${emailCliente}</p>
                    <hr style="border:none; border-top:1px solid #cbd5e1; margin:15px 0;">
                    <p><strong>Messaggio:</strong></p>
                    <blockquote style="background:#f1f5f9; padding:12px 16px; border-left:4px solid #0b2545; margin:0; font-style:italic;">
                        "${messaggio}"
                    </blockquote>
                    <hr style="border:none; border-top:1px solid #cbd5e1; margin:20px 0 15px 0;">
                    <p style="font-size:0.85rem; color:#64748b;">Puoi rispondere direttamente al cliente a questa email: ${emailCliente}</p>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: nome, email: ADMIN_NOTIFICATION_EMAIL },
                    to: [{ email: ADMIN_NOTIFICATION_EMAIL, name: "Admin Palermo Tour" }],
                    replyTo: { email: emailCliente, name: nome },
                    subject: `[Messaggio Contatti] Da ${nome} (${emailCliente})`,
                    htmlContent: htmlContatto
                })
            });

            if (response.ok) {
                return { success: true };
            }
        } catch (e) {
            console.error("Errore invio messaggio contatti Brevo:", e);
        }
        return { success: false };
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

        // Recupera le impostazioni dei testi personalizzati dall'Admin
        const tConf = (window.emailTemplateEditor && typeof window.emailTemplateEditor.getConfig === 'function')
            ? window.emailTemplateEditor.getConfig()
            : {
                subject: '[Conferma Prenotazione] Il tuo Tour a Palermo è Confermato!',
                welcomeMessage: 'Grazie per aver scelto Sicily Palermo Tour! La tua prenotazione è stata ricevuta ed è confermata.',
                instructions: '📍 Vi preghiamo di arrivare 10 minuti prima dell\'orario previsto al punto d\'incontro. Consigliamo scarpe comode e macchina fotografica.',
                footerText: 'Siamo a tua completa disposizione per qualsiasi informazione o esigenza particolare. A presto a Palermo!'
            };

        const subjectDyn = tConf.subject.replace('{NOME_TOUR}', tourTitle).replace('{CODICE_PRENOTAZIONE}', code);

        // 1. Email di Conferma Personalizzata per il Turista
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
                        <h2 style="color:#0b2545; margin-top:0;">Ciao ${customerName}!</h2>
                        <p style="font-size:0.95rem; color:#475569; line-height:1.6;">
                            ${tConf.welcomeMessage}
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

                        <div style="background:#fffbf5; border:1.5px solid #fed7aa; border-radius:12px; padding:16px; margin-bottom:20px; font-size:0.9rem; color:#9a3412; line-height:1.5;">
                            <strong>🎒 Istruzioni & Raccomandazioni:</strong><br>
                            ${tConf.instructions}
                        </div>

                        <p style="font-size:0.9rem; color:#64748b; line-height:1.5;">
                            ${tConf.footerText}
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

        try {
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
                    subject: subjectDyn,
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
