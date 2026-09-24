/**
 * MODULO 3: Impostazioni del Sito & Configurazione WhatsApp
 * Sicily Palermo Tour - Admin
 */

const WA_STORAGE_KEY_MODULE = 'spt_whatsapp_number';

function caricaNumeroWhatsApp() {
    const input = document.getElementById('wa-number-input');
    if (input) {
        input.value = localStorage.getItem(WA_STORAGE_KEY_MODULE) || '393000000000';
    }
}

function salvaNumeroWhatsApp() {
    const input = document.getElementById('wa-number-input');
    if (!input) return;

    const num = input.value.trim().replace(/[^0-9]/g, '');
    if (num.length >= 8) {
        localStorage.setItem(WA_STORAGE_KEY_MODULE, num);
        alert(`Numero WhatsApp salvato con successo: +${num}`);
    } else {
        alert('Inserisci un numero di telefono valido con prefisso (es. 393401234567).');
    }
}

function caricaChiaviStripe() {
    const pkInput = document.getElementById('stripe-pk-input');
    const skInput = document.getElementById('stripe-sk-input');

    if (pkInput) pkInput.value = localStorage.getItem('spt_stripe_pk') || '';
    if (skInput) skInput.value = localStorage.getItem('spt_stripe_sk') || '';
}

function salvaChiaviStripe() {
    const pkInput = document.getElementById('stripe-pk-input');
    const skInput = document.getElementById('stripe-sk-input');

    if (pkInput && skInput) {
        const pk = pkInput.value.trim();
        const sk = skInput.value.trim();

        if (pk) localStorage.setItem('spt_stripe_pk', pk);
        if (sk) localStorage.setItem('spt_stripe_sk', sk);

        if (window.stripePayment) {
            window.stripePayment.saveKeys(pk, sk);
        }

        alert('✅ Chiavi Stripe salvate con successo nel tuo browser!');
    }
}

function caricaChiaveBrevo() {
    const input = document.getElementById('brevo-key-input');
    if (input) input.value = localStorage.getItem('spt_brevo_api_key') || '';
}

function salvaChiaveBrevo() {
    const input = document.getElementById('brevo-key-input');
    if (!input) return;

    const key = input.value.trim();
    if (key) {
        localStorage.setItem('spt_brevo_api_key', key);
        if (window.brevoEmailService) {
            window.brevoEmailService.saveApiKey(key);
        }
        alert('✅ API Key Brevo Email salvata con successo!');
    } else {
        alert('Per favore inserisci la tua API Key di Brevo.');
    }
}

function toggleSettingBox(boxId) {
    const box = document.getElementById(boxId);
    const arrow = document.getElementById('arrow-' + boxId);

    if (box) {
        if (box.classList.contains('hidden')) {
            box.classList.remove('hidden');
            if (arrow) arrow.textContent = '▲';
            if (boxId === 'box-stripe') caricaChiaviStripe();
            if (boxId === 'box-brevo') caricaChiaveBrevo();
        } else {
            box.classList.add('hidden');
            if (arrow) arrow.textContent = '▼';
        }
    }
}
