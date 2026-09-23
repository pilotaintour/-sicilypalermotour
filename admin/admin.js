/**
 * Gestione Pannello Amministrazione - Sicily Palermo Tour
 */

// Chiavi LocalStorage
const STORAGE_KEY = 'spt_itineraries';
const AUTH_KEY = 'spt_admin_logged_in';
const WA_STORAGE_KEY = 'spt_whatsapp_number';

// Email Autorizzata Amministratore
const AUTHORIZED_EMAIL = 'pilotaintour13@gmail.com';

// Itinerari Iniziali Predefiniti
const DEFAULT_ITINERARIES = [
    {
        id: '1',
        title: 'Palermo Arabo-Normanna',
        category: 'Storia e Cultura',
        duration: '3 Ore',
        price: 'Da 25€',
        featured: 'true',
        imageUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800',
        shortDesc: 'Visita la Cattedrale, il Palazzo dei Normanni e la meravigliosa Cappella Palatina, patrimonio UNESCO.',
        fullDesc: 'Un viaggio straordinario nel cuore di Palermo tra architetture uniche al mondo. Tappe principali:\n1. Cattedrale di Palermo\n2. Palazzo dei Normanni e Cappella Palatina\n3. Chiesa di San Giovanni degli Eremiti\n4. Quattro Canti e Piazza Pretoria.'
    },
    {
        id: '2',
        title: 'Tour del Gusto e Street Food',
        category: 'Street Food',
        duration: '2.5 Ore',
        price: 'Da 20€',
        featured: 'true',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
        shortDesc: 'Esplora i mercati storici di Ballarò e del Capo assaggiando panelle, crocchè e il pane con la milza.',
        fullDesc: 'Vivi l\'esperienza gastronomica palermitana autentica nei vicoli e tra i banchi dei mercati secolari. Assaggerai:\n- Panelle e Crocchè calde\n- Sfincione palermitano\n- Pane con la milza (per i più audaci)\n- Cannolo siciliano artigianale.'
    },
    {
        id: '3',
        title: 'Mondello e il Barocco',
        category: 'Mare e Natura',
        duration: 'Mezza Giornata',
        price: 'Da 30€',
        featured: 'false',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
        shortDesc: 'Rilassati sulla spiaggia dorata di Mondello e ammira le splendide ville Liberty e il centro barocco.',
        fullDesc: 'Dalla costa cristallina alla bellezza architettonica Liberty del borgo marinaro di Mondello. Comprende passeggiata panoramica e sosta per gelato artigianale sul mare.'
    }
];

// Inizializzazione all'avvio: Accesso Diretto per l'Admin
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem(AUTH_KEY, 'true');
    verificaStatoAutenticazione();
    caricaNumeroWhatsApp();
});

// Passaggio tra le Schede Admin (Gestione Itinerari / Impostazioni Sito)
function mostraSezione(sezioneId, btnElement) {
    const sezioneItinerari = document.getElementById('sezione-itinerari');
    const sezioneImpostazioni = document.getElementById('sezione-impostazioni');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    if (sezioneId === 'sezione-itinerari') {
        if (sezioneItinerari) sezioneItinerari.classList.remove('hidden');
        if (sezioneImpostazioni) sezioneImpostazioni.classList.add('hidden');
    } else if (sezioneId === 'sezione-impostazioni') {
        if (sezioneItinerari) sezioneItinerari.classList.add('hidden');
        if (sezioneImpostazioni) sezioneImpostazioni.classList.remove('hidden');
    }
}

// Espande / Comprime una voce della lista Impostazioni
function toggleSettingBox(boxId) {
    const box = document.getElementById(boxId);
    const arrow = document.getElementById('arrow-' + boxId);

    if (box) {
        if (box.classList.contains('hidden')) {
            box.classList.remove('hidden');
            if (arrow) arrow.textContent = '▲';
        } else {
            box.classList.add('hidden');
            if (arrow) arrow.textContent = '▼';
        }
    }
}

// Verifica e attiva la vista Dashboard
function verificaStatoAutenticazione() {
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userControls = document.getElementById('user-controls');
    const welcomeMsg = document.getElementById('welcome-msg');

    if (isLoggedIn) {
        if (loginSection) loginSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (userControls) userControls.classList.remove('hidden');
        if (welcomeMsg) {
            welcomeMsg.textContent = `👤 Admin: ${AUTHORIZED_EMAIL}`;
        }
        caricaElencoItinerari();
    } else {
        if (loginSection) loginSection.classList.remove('hidden');
        if (dashboardSection) dashboardSection.classList.add('hidden');
        if (userControls) userControls.classList.add('hidden');
    }
}

// Gestione Numero WhatsApp
function caricaNumeroWhatsApp() {
    const input = document.getElementById('wa-number-input');
    if (input) {
        input.value = localStorage.getItem(WA_STORAGE_KEY) || '393000000000';
    }
}

function salvaNumeroWhatsApp() {
    const input = document.getElementById('wa-number-input');
    if (!input) return;

    const num = input.value.trim().replace(/[^0-9]/g, '');
    if (num.length >= 8) {
        localStorage.setItem(WA_STORAGE_KEY, num);
        alert(`Numero WhatsApp salvato con successo: +${num}`);
    } else {
        alert('Inserisci un numero di telefono valido con prefisso (es. 393401234567).');
    }
}

// Recupera gli itinerari dal localStorage (o inizializza con i default)
function getItinerari() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITINERARIES));
        return DEFAULT_ITINERARIES;
    }
    try {
        return JSON.parse(saved);
    } catch (e) {
        return DEFAULT_ITINERARIES;
    }
}

// Salva array itinerari nel localStorage
function saveItinerari(itinerari) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerari));
}

// Renderizza la lista degli itinerari nel pannello
function caricaElencoItinerari() {
    const itinerari = getItinerari();
    const container = document.getElementById('itineraries-list');
    const countBadge = document.getElementById('itinerary-count');

    if (!container || !countBadge) return;

    countBadge.textContent = itinerari.length;

    if (itinerari.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">Nessun itinerario presente. Aggiungine uno nuovo!</p>';
        return;
    }

    container.innerHTML = itinerari.map(item => `
        <div class="itinerary-item">
            <img class="item-thumb" src="${item.imageUrl || 'https://via.placeholder.com/90?text=Palermo'}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/90?text=Foto'">
            <div class="item-content">
                <span class="item-badge">${item.category}</span>
                ${item.featured === 'true' ? '<span class="item-badge" style="background:#dbeafe; color:#1e40af;">⭐ Evidenza</span>' : ''}
                <div class="item-title">${escapeHtml(item.title)}</div>
                <div class="item-meta">⏱️ ${escapeHtml(item.duration || 'N/D')} | 💰 ${escapeHtml(item.price || 'N/D')}</div>
                <div class="item-desc">${escapeHtml(item.shortDesc)}</div>
            </div>
            <div class="item-actions">
                <button class="btn-secondary btn-small" onclick="preparaModifica('${item.id}')">✏️ Edit</button>
                <button class="btn-danger btn-small" onclick="eliminaItinerario('${item.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Aggiunge o aggiorna un itinerario
function salvaItinerario(event) {
    event.preventDefault();

    const id = document.getElementById('itinerary-id').value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const duration = document.getElementById('duration').value.trim();
    const price = document.getElementById('price').value.trim();
    const featured = document.getElementById('featured').value;
    const imageUrl = document.getElementById('image-url').value.trim();
    const shortDesc = document.getElementById('short-desc').value.trim();
    const fullDesc = document.getElementById('full-desc').value.trim();

    let itinerari = getItinerari();

    if (id) {
        // Aggiornamento esistente
        itinerari = itinerari.map(item => {
            if (item.id === id) {
                return { id, title, category, duration, price, featured, imageUrl, shortDesc, fullDesc };
            }
            return item;
        });
        alert('Itinerario aggiornato con successo!');
    } else {
        // Nuovo Inserimento
        const nuovoItinerario = {
            id: Date.now().toString(),
            title, category, duration, price, featured, imageUrl, shortDesc, fullDesc
        };
        itinerari.unshift(nuovoItinerario); // Aggiunge in cima
        alert('Nuovo itinerario pubblicato con successo!');
    }

    saveItinerari(itinerari);
    resetForm();
    caricaElencoItinerari();
}

// Prepara il form per la modifica
function preparaModifica(id) {
    const itinerari = getItinerari();
    const item = itinerari.find(i => i.id === id);

    if (!item) return;

    document.getElementById('itinerary-id').value = item.id;
    document.getElementById('title').value = item.title;
    document.getElementById('category').value = item.category;
    document.getElementById('duration').value = item.duration || '';
    document.getElementById('price').value = item.price || '';
    document.getElementById('featured').value = item.featured || 'false';
    document.getElementById('image-url').value = item.imageUrl || '';
    document.getElementById('short-desc').value = item.shortDesc || '';
    document.getElementById('full-desc').value = item.fullDesc || '';

    // UI Updates
    document.getElementById('form-title').textContent = '✏️ Modifica Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Modifiche';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    anteprimaImmagine();

    // Scroll verso il form
    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

// Annulla la modifica
function annullaModifica() {
    resetForm();
}

// Reset del form
function resetForm() {
    document.getElementById('itineraryForm').reset();
    document.getElementById('itinerary-id').value = '';
    document.getElementById('form-title').textContent = '➕ Aggiungi Nuovo Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Itinerario';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    document.getElementById('image-preview-box').classList.add('hidden');
}

// Elimina itinerario
function eliminaItinerario(id) {
    if (!confirm('Sei sicuro di voler eliminare questo itinerario?')) return;

    let itinerari = getItinerari();
    itinerari = itinerari.filter(i => i.id !== id);
    saveItinerari(itinerari);

    // Se stavamo modificando proprio questo itinerario, resetta il form
    if (document.getElementById('itinerary-id').value === id) {
        resetForm();
    }

    caricaElencoItinerari();
}

// Ripristina i dati demo di default
function resetDemoData() {
    if (confirm('Vuoi ripristinare gli itinerari demo iniziali? Tutti i dati correnti verranno sovrascritti.')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITINERARIES));
        resetForm();
        caricaElencoItinerari();
    }
}

// Anteprima immagine in tempo reale
function anteprimaImmagine() {
    const url = document.getElementById('image-url').value.trim();
    const box = document.getElementById('image-preview-box');
    const img = document.getElementById('image-preview');

    if (url) {
        img.src = url;
        box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}

// Helper per evitare attacchi XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#032;");
}
