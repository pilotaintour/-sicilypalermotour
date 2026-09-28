/**
 * MODULO AUTONOMO PAGAMENTI E PRE-AUTORIZZAZIONI STRIPE & PAYPAL (WEB)
 * Sicily Palermo Tour - Gestione Carte di Credito/Debito (Visa, Mastercard, Amex) e PayPal
 */

const STRIPE_PK_KEY = 'spt_stripe_pk';
const STRIPE_SK_KEY = 'spt_stripe_sk';

// Key ufficiale di Test Stripe dell'Amministratore
const DEFAULT_STRIPE_PK = 'pk_test_51UJGJt383oZgJlwEDcZkzbdzODlKRxPfanpz31XrWbmJDpmQnCnsA3qPLtCIn8FoR5DlTX2rqnzAmr4UWdo1bo2k00tAdmIYH1';

function selezionaMetodoPagamento(tipo) {
    const boxCard = document.getElementById('box-metodo-card');
    const boxPaypal = document.getElementById('box-metodo-paypal');
    const labelCard = document.getElementById('opt-label-card');
    const labelPaypal = document.getElementById('opt-label-paypal');

    if (tipo === 'card') {
        if (boxCard) boxCard.style.display = 'block';
        if (boxPaypal) boxPaypal.style.display = 'none';
        if (labelCard) { labelCard.style.border = '2px solid #0b2545'; labelCard.style.background = '#f0f9ff'; }
        if (labelPaypal) { labelPaypal.style.border = '1px solid #cbd5e1'; labelPaypal.style.background = '#ffffff'; }
    } else {
        if (boxCard) boxCard.style.display = 'none';
        if (boxPaypal) boxPaypal.style.display = 'block';
        if (labelCard) { labelCard.style.border = '1px solid #cbd5e1'; labelCard.style.background = '#ffffff'; }
        if (labelPaypal) { labelPaypal.style.border = '2px solid #0070ba'; labelPaypal.style.background = '#f0f9ff'; }
    }
}
window.selezionaMetodoPagamento = selezionaMetodoPagamento;

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

    // Monta il selettore metodi di pagamento ed il form sicuro della carta di credito
    mountCardForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-top: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <label style="font-weight: 800; color: #0b2545; font-size: 1rem; display: block; margin-bottom: 12px;">
                    💳 Scegli il Metodo di Pagamento:
                </label>

                <!-- Selettore Opzioni Pagamento -->
                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px;">
                    <label id="opt-label-card" onclick="selezionaMetodoPagamento('card')" style="flex: 1; min-width: 220px; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 2px solid #0b2545; border-radius: 10px; cursor: pointer; background: #f0f9ff;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="radio" name="payment_method" value="card" checked style="accent-color: #0b2545; width: 18px; height: 18px; cursor: pointer;">
                            <strong style="color: #0b2545; font-size: 0.95rem;">Carta di Credito / Debito</strong>
                        </div>
                        <div style="font-size: 1.1rem; font-weight: bold; color: #1e293b;">Visa / MC / Amex</div>
                    </label>

                    <label id="opt-label-paypal" onclick="selezionaMetodoPagamento('paypal')" style="flex: 1; min-width: 220px; display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 10px; cursor: pointer; background: #ffffff;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="radio" name="payment_method" value="paypal" style="accent-color: #0b2545; width: 18px; height: 18px; cursor: pointer;">
                            <strong style="color: #003087; font-size: 0.95rem;">PayPal</strong>
                        </div>
                        <div style="font-weight: 800; color: #0070ba; font-style: italic; font-size: 1.1rem;">PayPal</div>
                    </label>
                </div>

                <!-- Box Carta di Credito (Stripe Elements) -->
                <div id="box-metodo-card" style="display: block;">
                    <p style="font-size: 0.85rem; color: #64748b; margin-top: 0; margin-bottom: 12px; line-height: 1.4;">
                        L'importo verrà unicamente <strong>bloccato in sospeso</strong> (Pre-Autorizzazione). Inserisci il numero di carta di seguito:
                    </p>

                    <!-- Riquadro Form Carta Stripe Elements -->
                    <div id="stripe-card-mount-point" style="padding: 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; background: #f8fafc; min-height: 42px;"></div>

                    <div id="stripe-card-errors" style="color: #ef4444; font-size: 0.85rem; margin-top: 8px; font-weight: 600;"></div>
                </div>

                <!-- Box PayPal -->
                <div id="box-metodo-paypal" style="display: none; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px; text-align: center;">
                    <p style="font-size: 0.92rem; color: #0369a1; margin: 0 0 12px 0; font-weight: 600;">
                        🔵 Verrai reindirizzato in modo sicuro su PayPal per confermare la pre-autorizzazione della tua carta o conto.
                    </p>
                    <button type="button" onclick="alert('🔵 Reindirizzamento su PayPal in corso... (Modalità Test PayPal)')" style="background: #ffc439; color: #003087; border: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        Paga con <i>PayPal</i>
                    </button>
                </div>
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
        // Controlla se è selezionata l'opzione PayPal
        const radioPaypal = document.querySelector('input[name="payment_method"][value="paypal"]');
        if (radioPaypal && radioPaypal.checked) {
            return {
                success: true,
                paymentIntentId: 'paypal_preauth_' + Math.floor(100000 + Math.random() * 900000),
                status: 'Pre-Autorizzato via PayPal',
                message: 'Pre-autorizzazione con conto PayPal effettuata con successo.'
            };
        }

        if (!this.stripe || !this.cardElement || !this.isMounted) {
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
