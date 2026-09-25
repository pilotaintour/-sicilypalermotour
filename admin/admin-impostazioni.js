/**
 * MODULO 3: Impostazioni del Sito, WhatsApp, Carte & Foto Copertina
 * Sicily Palermo Tour - Admin
 */

const WA_STORAGE_KEY_MODULE = 'spt_whatsapp_number';
let fotoHeroCorrenti = [];

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

// GESTIONE FOTO SFONDO COPERTINA HOMEPAGE (HERO SLIDER)
function caricaFotoHeroConfig() {
    try {
        fotoHeroCorrenti = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]');
    } catch (e) {
        fotoHeroCorrenti = [];
    }
    if (!fotoHeroCorrenti || fotoHeroCorrenti.length === 0) {
        fotoHeroCorrenti = [
            'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=1600',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600',
            'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=1600'
        ];
    }
    renderGalleriaHeroAdmin();
}

function gestisciCaricamentoFotoHero(event) {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    let completati = 0;
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            fotoHeroCorrenti.push(e.target.result);
            completati++;
            if (completati === files.length) {
                renderGalleriaHeroAdmin();
                event.target.value = '';
            }
        };
        reader.readAsDataURL(file);
    });
}

function aggiungiUrlFotoHero() {
    const input = document.getElementById('hero-photo-url-input');
    if (!input) return;
    const url = input.value.trim();
    if (url) {
        fotoHeroCorrenti.push(url);
        input.value = '';
        renderGalleriaHeroAdmin();
    }
}

function rimuoviFotoHero(index) {
    fotoHeroCorrenti.splice(index, 1);
    renderGalleriaHeroAdmin();
}

function renderGalleriaHeroAdmin() {
    const container = document.getElementById('hero-gallery-preview');
    if (!container) return;

    if (fotoHeroCorrenti.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; grid-column:1/-1;">Nessuna foto copertina impostata.</p>';
        return;
    }

    container.innerHTML = fotoHeroCorrenti.map((imgUrl, idx) => `
        <div style="position:relative; width:130px; height:85px; border-radius:8px; overflow:hidden; border:1.5px solid #cbd5e1; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
            <img src="${imgUrl}" alt="Hero ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">
            <button type="button" onclick="rimuoviFotoHero(${idx})" style="position:absolute; top:4px; right:4px; background:rgba(239,68,68,0.9); color:white; border:none; border-radius:50%; width:22px; height:22px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.75rem;" title="Rimuovi foto">✕</button>
        </div>
    `).join('');
}

async function salvaFotoHero() {
    if (fotoHeroCorrenti.length === 0) {
        alert("Inserisci almeno una foto per lo sfondo della copertina.");
        return;
    }
    localStorage.setItem('spt_hero_photos', JSON.stringify(fotoHeroCorrenti));
    if (window.cloudDB) {
        await window.cloudDB.salvaFotoHeroCloud(fotoHeroCorrenti);
    }
    alert(`☁️ ${fotoHeroCorrenti.length} foto della copertina pubblicate nel Cloud con successo! Ora qualsiasi utente Ospite o turista vedrà le tue foto aggiornate.`);
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
            if (boxId === 'box-hero-photos') caricaFotoHeroConfig();
            if (boxId === 'box-email-template') {
                if (typeof caricaTemplateEmailInAdmin === 'function') caricaTemplateEmailInAdmin();
            }
        } else {
            box.classList.add('hidden');
            if (arrow) arrow.textContent = '▼';
        }
    }
}
