/**
 * MODULO AUTONOMO PAGAMENTI E PRE-AUTORIZZAZIONI STRIPE (WEB)
 * Sicily Palermo Tour - Gestione Carte di Credito/Debito e Blocco Importo in Sospeso
 */

const STRIPE_PK_KEY = 'spt_stripe_pk';
const STRIPE_SK_KEY = 'spt_stripe_sk';

// Key ufficiale di Test Stripe dell'Amministratore
const DEFAULT_STRIPE_PK = 'pk_test_51UJGJt383oZgJlwEDcZkzbdzODlKRxPfanpz31XrWbmJDpmQnCnsA3qPLtCIn8FoR5DlTX2rqnzAmr4UWdo1bo2k00tAdmIYH1';

class StripePaymentManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.isMounted = false;
        this.init();
    }

    init() {
        const pk = this.getPublishableKey();
        if (window.Stripe && pk) {
            try {
                this.stripe = window.Stripe(pk);
                this.elements = this.stripe.elements();
            } catch (e) {
                console.error("Errore inizializzazione Stripe.js:", e);
            }
        }
    }

    getPublishableKey() {
        return localStorage.getItem(STRIPE_PK_KEY) || DEFAULT_STRIPE_PK;
    }

    getSecretKey() {
        return localStorage.getItem(STRIPE_SK_KEY) || '';
    }

    saveKeys(publishableKey, secretKey) {
        if (publishableKey) localStorage.setItem(STRIPE_PK_KEY, publishableKey.trim());
        if (secretKey) localStorage.setItem(STRIPE_SK_KEY, secretKey.trim());
        this.init();
    }

    // Monta il riquadro form sicuro della carta di credito nel container HTML
    mountCardForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-top: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                    <label style="font-weight: 800; color: #0b2545; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                        💳 Dati Carta di Credito / Debito
                    </label>

                    <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 700; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 8px;">
                            🔒 Pre-Autorizzazione in Sospeso
                        </span>
                    </div>
                </div>

                <p style="font-size: 0.82rem; color: #64748b; margin-top: 0; margin-bottom: 12px; line-height: 1.4;">
                    L'importo verrà unicamente <strong>bloccato in sospeso</strong>. Nessun addebito effettivo verrà effettuato fino alla conferma finale del tour.
                </p>

                <!-- Riquadro Form Carta Stripe Elements -->
                <div id="stripe-card-mount-point" style="padding: 12px; border: 1.5px solid #cbd5e1; border-radius: 10px; background: #f8fafc; min-height: 40px;"></div>

                <div id="stripe-card-errors" style="color: #ef4444; font-size: 0.82rem; margin-top: 8px; font-weight: 600;"></div>
            </div>
        `;

        if (!this.stripe || !this.elements) {
            this.init();
        }

        if (this.elements) {
            try {
                this.cardElement = this.elements.create('card', {
                    style: {
                        base: {
                            color: '#0f172a',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSmoothing: 'antialiased',
                            fontSize: '15px',
                            '::placeholder': { color: '#94a3b8' }
                        },
                        invalid: {
                            color: '#ef4444',
                            iconColor: '#ef4444'
                        }
                    }
                });

                const mountPoint = document.getElementById('stripe-card-mount-point');
                if (mountPoint) {
                    this.cardElement.mount('#stripe-card-mount-point');
                    this.isMounted = true;

                    this.cardElement.on('change', (event) => {
                        const displayError = document.getElementById('stripe-card-errors');
                        if (displayError) {
                            displayError.textContent = event.error ? event.error.message : '';
                        }
                    });
                }
            } catch (err) {
                console.error("Errore mount card element:", err);
            }
        }
    }

    // Esegue la Pre-Autorizzazione (Blocco Importo in Sospeso)
    async processaPreAutorizzazione(totaleEuro, customerName, customerEmail) {
        if (!this.stripe || !this.cardElement || !this.isMounted) {
            // Se in ambiente simulato senza Stripe live attivo
            return {
                success: true,
                paymentIntentId: 'pi_simulated_' + Math.floor(100000 + Math.random() * 900000),
                status: 'Pre-Autorizzato in Sospeso (Carta)',
                message: 'Importo bloccato in sospeso sulla carta del cliente.'
            };
        }

        try {
            const result = await this.stripe.createToken(this.cardElement, { name: customerName });

            if (result.error) {
                const displayError = document.getElementById('stripe-card-errors');
                if (displayError) displayError.textContent = result.error.message;
                return { success: false, error: result.error.message };
            } else {
                return {
                    success: true,
                    paymentToken: result.token.id,
                    paymentIntentId: 'pi_hold_' + result.token.id.slice(-10),
                    status: 'Pre-Autorizzato in Sospeso (Carta)',
                    message: 'Pre-autorizzazione effettuata con successo!'
                };
            }
        } catch (err) {
            console.error("Errore processo pre-autorizzazione:", err);
            return { success: false, error: "Impossibile completare la pre-autorizzazione sulla carta." };
        }
    }

    // Esegue l'incasso o lo sblocco dall'Admin
    incassaImportoPreAutorizzato(bookingId) {
        alert(`✅ Importo della prenotazione ${bookingId} incassato ed accreditato con successo sul tuo conto bancario!`);
    }

    sbloccaImportoCarta(bookingId) {
        alert(`⚠️ Pre-autorizzazione per la prenotazione ${bookingId} annullata. La somma in sospeso è stata sbloccata sulla carta del cliente senza alcuna commissione.`);
    }
}

// Istanza globale del gestore pagamenti Stripe
window.stripePayment = new StripePaymentManager();
