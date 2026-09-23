/**
 * Gestione Pannello Amministrazione - Sicily Palermo Tour
 */

// Chiavi LocalStorage
const STORAGE_KEY = 'spt_itineraries';
const AUTH_KEY = 'spt_admin_logged_in';
const WA_STORAGE_KEY = 'spt_whatsapp_number';

// Email Autorizzata Amministratore
const AUTHORIZED_EMAIL = 'pilotaintour13@gmail.com';

// State locale per foto, tappe e orari durante la compilazione del form
let fotoItinerarioCorrenti = [];
let tappeCorrenti = [];
let orariCorrenti = ['09:30', '11:30', '15:30', '18:00'];

// Itinerari Iniziali Predefiniti
const DEFAULT_ITINERARIES = [
    {
        id: '1',
        title: 'Palermo Arabo-Normanna',
        category: 'Storia e Cultura',
        duration: '3 Ore',
        price: 'Da 25€',
        meetingPoint: 'Piazza Bellini / Cattedrale',
        featured: 'true',
        imageUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800',
            'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=800',
            'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800'
        ],
        tappe: [
            'Cattedrale di Palermo',
            'Palazzo dei Normanni e Cappella Palatina',
            'Chiesa di San Giovanni degli Eremiti',
            'Quattro Canti e Piazza Pretoria'
        ],
        servizi: ['Guida Locale Esperta', 'Assistenza Personalizzata', 'Adatto a Famiglie'],
        shortDesc: 'Visita la Cattedrale, il Palazzo dei Normanni e la meravigliosa Cappella Palatina, patrimonio UNESCO.',
        fullDesc: 'Un viaggio straordinario nel cuore di Palermo tra architetture uniche al mondo.'
    },
    {
        id: '2',
        title: 'Tour del Gusto e Street Food',
        category: 'Street Food',
        duration: '2.5 Ore',
        price: 'Da 20€',
        meetingPoint: 'Mercato di Ballarò',
        featured: 'true',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800'
        ],
        tappe: [
            'Panelle e Crocchè calde',
            'Sfincione palermitano artigianale',
            'Pane con la milza (per i più audaci)',
            'Cannolo siciliano con ricotta fresca'
        ],
        servizi: ['Guida Locale Esperta', 'Degustazione Cibo', 'Adatto a Famiglie'],
        shortDesc: 'Esplora i mercati storici di Ballarò e del Capo assaggiando panelle, crocchè e il pane con la milza.',
        fullDesc: 'Vivi l\'esperienza gastronomica palermitana autentica nei vicoli e tra i banchi dei mercati secolari.'
    },
    {
        id: '3',
        title: 'Mondello e il Barocco',
        category: 'Mare e Natura',
        duration: 'Mezza Giornata',
        price: 'Da 30€',
        meetingPoint: 'Piazza Politeama',
        featured: 'false',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'
        ],
        tappe: [
            'Passeggiata sul lungomare di Mondello',
            'Ammirare le Ville Liberty e lo Stabilimento Balneare',
            'Sosta per gelato artigianale o granita siciliana',
            'Rientro panoramico verso Palermo'
        ],
        servizi: ['Guida Locale Esperta', 'Assistenza Personalizzata', 'Cancellazione Gratuita'],
        shortDesc: 'Rilassati sulla spiaggia dorata di Mondello e ammira le splendide ville Liberty e il centro barocco.',
        fullDesc: 'Dalla costa cristallina alla bellezza architettonica Liberty del borgo marinaro di Mondello.'
    }
];

// Inizializzazione all'avvio
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem(AUTH_KEY, 'true');
    verificaStatoAutenticazione();
    caricaNumeroWhatsApp();
    renderCampiTappe();
    renderCampiOrari();
});

// Gestione Modale e Tabella Orari
function apriModalTabellaOrari() {
    const modal = document.getElementById('modal-tabella-orari');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        renderCampiOrari();
    }
}

function chiudiModalTabellaOrari(event) {
    if (event && event.target && event.target.id !== 'modal-tabella-orari') {
        return;
    }
    const modal = document.getElementById('modal-tabella-orari');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        renderCampiOrari();
    }
}

function normalizzaOrari(arr) {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(item => {
        if (typeof item === 'string') {
            return { time: item, capacity: 15 };
        }
        if (item && typeof item === 'object' && item.time) {
            return { time: item.time, capacity: parseInt(item.capacity, 10) || 15 };
        }
        return null;
    }).filter(Boolean).sort((a, b) => a.time.localeCompare(b.time));
}

function renderCampiOrari() {
    orariCorrenti = normalizzaOrari(orariCorrenti);

    // 1. Renderizza la lista degli orari attivi con input capienza modificabile direttamente
    const activeList = document.getElementById('orari-active-list');
    if (activeList) {
        if (orariCorrenti.length === 0) {
            activeList.innerHTML = '<span style="font-size:0.85rem; color:#94a3b8; padding:8px;">Nessun orario selezionato. Clicca su "Seleziona Orari dalla Tabella" per aggiungerli!</span>';
        } else {
            activeList.innerHTML = orariCorrenti.map((item, idx) => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; gap: 10px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <strong style="color: #1b4f72; font-size: 1.05rem;">⏰ Orario: ${escapeHtml(item.time)}</strong>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <label style="font-size: 0.85rem; color: #475569; margin: 0; font-weight: 600;">Capienza Max:</label>
                        <input type="number" min="1" max="500" value="${item.capacity}" onchange="aggiornaCapienzaOrario(${idx}, this.value)" style="width: 75px; padding: 6px 8px; border: 1.5px solid #1b4f72; border-radius: 6px; font-weight: bold; text-align: center; color: #1b4f72; font-size: 0.95rem;">
                        <span style="font-size: 0.85rem; color: #64748b;">persone</span>
                        <button type="button" class="btn-danger btn-small" onclick="toggleOrario('${item.time}')" style="margin-left: 8px;" title="Rimuovi orario">✕ Rimuovi</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // 2. Renderizza la Tabella Orari nel Popup Modale (Righe = Ore, Colonne = Minuti :00, :15, :30, :45)
    const tableBody = document.getElementById('orari-table-body');
    if (!tableBody) return;

    let rowsHtml = '';
    for (let h = 8; h <= 23; h++) {
        const hStr = String(h).padStart(2, '0');
        rowsHtml += `<tr>`;
        rowsHtml += `<td style="padding: 8px; font-weight: bold; background: #f8fafc; border: 1px solid #e2e8f0; color: #1b4f72;">${hStr}:00</td>`;

        ['00', '15', '30', '45'].forEach(mStr => {
            const timeStr = `${hStr}:${mStr}`;
            const trovato = orariCorrenti.find(o => o.time === timeStr);
            const isSelected = !!trovato;

            const bgStyle = isSelected
                ? 'background: #1b4f72; color: #ffffff; font-weight: bold;'
                : 'background: #ffffff; color: #334155;';

            rowsHtml += `
                <td style="padding: 4px; border: 1px solid #e2e8f0;">
                    <button type="button"
                            onclick="toggleOrario('${timeStr}')"
                            style="${bgStyle} width: 100%; padding: 6px 2px; border: 1px solid ${isSelected ? '#1b4f72' : '#cbd5e1'}; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.15s ease;">
                        ${isSelected ? `✓ ${timeStr}<br><small style="font-size:0.72rem; opacity:0.9;">(${trovato.capacity}p)</small>` : timeStr}
                    </button>
                </td>
            `;
        });

        rowsHtml += `</tr>`;
    }

    tableBody.innerHTML = rowsHtml;
}

function aggiornaCapienzaOrario(index, nuovaCapienza) {
    if (orariCorrenti[index]) {
        orariCorrenti[index].capacity = parseInt(nuovaCapienza, 10) || 15;
        renderCampiOrari();
    }
}

function toggleOrario(timeStr) {
    const inputCap = document.getElementById('capienza-selezione-input');
    const targetCapacity = inputCap ? (parseInt(inputCap.value, 10) || 15) : 15;

    const idx = orariCorrenti.findIndex(o => o.time === timeStr);

    if (idx !== -1) {
        if (orariCorrenti[idx].capacity === targetCapacity) {
            orariCorrenti.splice(idx, 1);
        } else {
            orariCorrenti[idx].capacity = targetCapacity;
        }
    } else {
        orariCorrenti.push({ time: timeStr, capacity: targetCapacity });
    }

    orariCorrenti.sort((a, b) => a.time.localeCompare(b.time));
    renderCampiOrari();
}

function applicaPresetOrari(tipo) {
    if (tipo === 'reset') {
        orariCorrenti = [];
        renderCampiOrari();
    }
}

// Gestione Dynamic Tappe Input Builder
function renderCampiTappe() {
    const container = document.getElementById('tappe-input-list');
    if (!container) return;

    if (tappeCorrenti.length === 0) {
        tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti storici'];
    }

    container.innerHTML = tappeCorrenti.map((tappaText, idx) => `
        <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-weight: bold; font-size: 0.85rem; color: #e67e22; width: 24px; text-align: center;">${idx + 1}.</span>
            <input type="text" class="tappa-input" value="${escapeHtml(tappaText)}" placeholder="Es. Tappa ${idx + 1}" oninput="aggiornaTappa(${idx}, this.value)" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
            ${tappeCorrenti.length > 1 ? `<button type="button" class="btn-danger btn-small" onclick="rimuoviCampoTappa(${idx})" title="Rimuovi tappa">✕</button>` : ''}
        </div>
    `).join('');
}

function aggiornaTappa(index, val) {
    tappeCorrenti[index] = val;
}

function aggiungiCampoTappa() {
    tappeCorrenti.push('');
    renderCampiTappe();

    // Focus sull'ultimo input creato
    setTimeout(() => {
        const inputs = document.querySelectorAll('.tappa-input');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    }, 50);
}

function rimuoviCampoTappa(index) {
    tappeCorrenti.splice(index, 1);
    renderCampiTappe();
}

// Passaggio tra le Schede Admin
function mostraSezione(sezioneId, btnElement) {
    const sezioneItinerari = document.getElementById('sezione-itinerari');
    const sezionePrenotazioni = document.getElementById('sezione-prenotazioni');
    const sezioneImpostazioni = document.getElementById('sezione-impostazioni');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    if (sezioneItinerari) sezioneItinerari.classList.add('hidden');
    if (sezionePrenotazioni) sezionePrenotazioni.classList.add('hidden');
    if (sezioneImpostazioni) sezioneImpostazioni.classList.add('hidden');

    if (sezioneId === 'sezione-itinerari') {
        if (sezioneItinerari) sezioneItinerari.classList.remove('hidden');
    } else if (sezioneId === 'sezione-prenotazioni') {
        if (sezionePrenotazioni) sezionePrenotazioni.classList.remove('hidden');
        caricaPrenotazioniAdmin();
    } else if (sezioneId === 'sezione-impostazioni') {
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

// Gestione Caricamento Foto Multiple dal Dispositivo
function gestisciCaricamentoFotoMultiple(event) {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    let completati = 0;

    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
                fotoItinerarioCorrenti.push(compressedDataUrl);

                completati++;
                if (completati === files.length) {
                    renderGalleriaAnteprima();
                    // Reset dell'input per permettere selezioni successive
                    event.target.value = '';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Aggiungi Foto da URL Web
function aggiungiUrlFoto() {
    const urlInput = document.getElementById('image-url');
    if (!urlInput) return;

    const url = urlInput.value.trim();
    if (url) {
        fotoItinerarioCorrenti.push(url);
        urlInput.value = '';
        renderGalleriaAnteprima();
    }
}

// Rimuove una foto dalla galleria di anteprima
function rimuoviFotoGalleria(index) {
    fotoItinerarioCorrenti.splice(index, 1);
    renderGalleriaAnteprima();
}

// Renderizza le miniature nell'Admin
function renderGalleriaAnteprima() {
    const container = document.getElementById('gallery-preview-container');
    if (!container) return;

    if (fotoItinerarioCorrenti.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; grid-column:1/-1;">Nessuna foto ancora aggiunta.</p>';
        return;
    }

    const htmlHeader = `<div style="grid-column:1/-1; font-weight:bold; font-size:0.85rem; color:#1b4f72;">🖼️ ${fotoItinerarioCorrenti.length} foto pronte per la galleria del tour:</div>`;

    container.innerHTML = htmlHeader + fotoItinerarioCorrenti.map((imgUrl, index) => `
        <div class="gallery-thumb-item">
            <img src="${imgUrl}" alt="Foto ${index + 1}">
            <button type="button" class="gallery-thumb-remove" onclick="rimuoviFotoGalleria(${index})" title="Rimuovi foto">✕</button>
        </div>
    `).join('');
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
        caricaPrenotazioniAdmin();
    } else {
        if (loginSection) loginSection.remove('hidden');
        if (dashboardSection) dashboardSection.add('hidden');
        if (userControls) userControls.add('hidden');
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

// Recupera gli itinerari dal localStorage
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

    container.innerHTML = itinerari.map(item => {
        const coverImg = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/90?text=Palermo');
        const totalPhotos = (item.images && item.images.length > 0) ? item.images.length : (item.imageUrl ? 1 : 0);
        const totalOrari = (item.timeSlots && item.timeSlots.length > 0) ? item.timeSlots.length : 0;

        return `
            <div class="itinerary-item">
                <img class="item-thumb" src="${coverImg}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/90?text=Foto'">
                <div class="item-content">
                    <span class="item-badge">${item.category}</span>
                    <span class="item-badge" style="background:#e0f2fe; color:#0369a1;">🖼️ ${totalPhotos} Foto</span>
                    <span class="item-badge" style="background:#fef3c7; color:#92400e;">⏰ ${totalOrari} Orari Attivi</span>
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
        `;
    }).join('');
}

// Aggiunge o aggiorna un itinerario
function salvaItinerario(event) {
    event.preventDefault();

    const id = document.getElementById('itinerary-id').value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const duration = document.getElementById('duration').value.trim();
    const price = document.getElementById('price').value.trim();
    const meetingPoint = document.getElementById('meeting-point').value.trim();
    const featured = document.getElementById('featured').value;
    const shortDesc = document.getElementById('short-desc').value.trim();
    const fullDesc = document.getElementById('full-desc').value.trim();

    // Raccoglie le tappe valide inserite
    const tappe = tappeCorrenti.map(t => t.trim()).filter(t => t !== '');

    // Raccoglie i servizi selezionati
    const serviziChecks = document.querySelectorAll('input[name="servizio-check"]:checked');
    const servizi = Array.from(serviziChecks).map(c => c.value);

    // Se non ha caricato foto nella galleria ma ha inserito qualcosa nel campo URL
    const singleUrl = document.getElementById('image-url').value.trim();
    if (singleUrl && !fotoItinerarioCorrenti.includes(singleUrl)) {
        fotoItinerarioCorrenti.push(singleUrl);
    }

    const images = [...fotoItinerarioCorrenti];
    const imageUrl = images.length > 0 ? images[0] : 'https://via.placeholder.com/400x200?text=Palermo+Tour';
    const timeSlots = [...orariCorrenti];
    const maxCapacity = (timeSlots.length > 0 && typeof timeSlots[0] === 'object') ? timeSlots[0].capacity : 15;

    let itinerari = getItinerari();

    if (id) {
        // Aggiornamento
        itinerari = itinerari.map(item => {
            if (String(item.id) === String(id)) {
                return { id, title, category, duration, price, meetingPoint, timeSlots, maxCapacity, featured, imageUrl, images, tappe, servizi, shortDesc, fullDesc };
            }
            return item;
        });
        alert('Itinerario aggiornato con successo!');
    } else {
        // Nuovo
        const nuovoItinerario = {
            id: Date.now().toString(),
            title, category, duration, price, meetingPoint, timeSlots, maxCapacity, featured, imageUrl, images, tappe, servizi, shortDesc, fullDesc
        };
        itinerari.unshift(nuovoItinerario);
        alert('Nuovo itinerario pubblicato con successo!');
    }

    saveItinerari(itinerari);
    resetForm();
    caricaElencoItinerari();
}

// Prepara il form per la modifica
function preparaModifica(id) {
    const itinerari = getItinerari();
    const item = itinerari.find(i => String(i.id) === String(id));

    if (!item) return;

    document.getElementById('itinerary-id').value = item.id;
    document.getElementById('title').value = item.title;
    document.getElementById('category').value = item.category;
    document.getElementById('duration').value = item.duration || '';
    document.getElementById('price').value = item.price || '';
    document.getElementById('meeting-point').value = item.meetingPoint || '';
    document.getElementById('featured').value = item.featured || 'false';
    document.getElementById('short-desc').value = item.shortDesc || '';
    document.getElementById('full-desc').value = item.fullDesc || '';

    // Popola tappe
    if (item.tappe && item.tappe.length > 0) {
        tappeCorrenti = [...item.tappe];
    } else {
        tappeCorrenti = ['Incontro con la guida'];
    }
    renderCampiTappe();

    // Popola orari
    if (item.timeSlots && item.timeSlots.length > 0) {
        orariCorrenti = [...item.timeSlots];
    } else {
        orariCorrenti = ['09:30', '11:30', '15:30', '18:00'];
    }
    renderCampiOrari();

    // Popola servizi
    const serviziChecks = document.querySelectorAll('input[name="servizio-check"]');
    serviziChecks.forEach(c => {
        c.checked = item.servizi ? item.servizi.includes(c.value) : true;
    });

    // Carica galleria foto
    if (item.images && item.images.length > 0) {
        fotoItinerarioCorrenti = [...item.images];
    } else if (item.imageUrl) {
        fotoItinerarioCorrenti = [item.imageUrl];
    } else {
        fotoItinerarioCorrenti = [];
    }

    renderGalleriaAnteprima();

    // UI Updates
    document.getElementById('form-title').textContent = '✏️ Modifica Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Modifiche';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

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
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
    fotoItinerarioCorrenti = [];
    tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti'];
    orariCorrenti = ['09:30', '11:30', '15:30', '18:00'];
    renderGalleriaAnteprima();
    renderCampiTappe();
    renderCampiOrari();
    document.getElementById('form-title').textContent = '➕ Aggiungi Nuovo Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Itinerario';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// Elimina itinerario
function eliminaItinerario(id) {
    if (!confirm('Sei sicuro di voler eliminare questo itinerario?')) return;

    let itinerari = getItinerari();
    itinerari = itinerari.filter(i => String(i.id) !== String(id));
    saveItinerari(itinerari);

    if (String(document.getElementById('itinerary-id').value) === String(id)) {
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

// Helper per evitare attacchi XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#032;");
}

/* ==========================================================================
   GESTIONE PRENOTAZIONI RICEVUTE ADMIN
   ========================================================================== */

function caricaPrenotazioniAdmin() {
    const listContainer = document.getElementById('admin-bookings-list');
    const badgeCount = document.getElementById('cnt-prenotazioni-badge');

    if (!listContainer) return;

    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
    } catch (e) {
        bookings = [];
    }

    if (badgeCount) badgeCount.textContent = bookings.length;

    if (bookings.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <h3>📥 Nessuna prenotazione ricevuta al momento</h3>
                <p>Le prenotazioni effettuate dai turisti dal sito compariranno qui in tempo reale.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            ${bookings.map((b, idx) => `
                <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 5px solid ${b.status === 'Confermata' ? '#10b981' : (b.status === 'Cancellata' ? '#ef4444' : '#1b4f72')}; border-radius: 10px; padding: 18px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;">${escapeHtml(b.code || '#SPT-BOOK')}</span>
                            <strong style="color: #1b4f72; font-size: 1.1rem; margin-left: 8px;">${escapeHtml(b.tourTitle)}</strong>
                        </div>
                        <div>
                            <span style="font-weight: bold; font-size: 0.85rem; padding: 4px 10px; border-radius: 12px; background: ${b.status === 'Confermata' ? '#d1fae5; color:#065f46;' : (b.status === 'Cancellata' ? '#fee2e2; color:#991b1b;' : '#fef3c7; color:#92400e;')};">
                                ${escapeHtml(b.status || 'In attesa')}
                            </span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.9rem; color: #334155; margin-bottom: 12px; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div>📅 <strong>Data:</strong> ${escapeHtml(b.dateReadable || b.dateISO)}</div>
                        <div>⏰ <strong>Orario:</strong> ${escapeHtml(b.time || '09:30')}</div>
                        <div>👥 <strong>Ospiti:</strong> ${b.adults} Adulti ${b.children > 0 ? `, ${b.children} Bambini` : ''}</div>
                        <div>💰 <strong>Totale:</strong> €${escapeHtml(b.total || '0.00')}</div>
                    </div>

                    <div style="font-size: 0.9rem; color: #475569; margin-bottom: 12px;">
                        👤 <strong>Cliente:</strong> ${escapeHtml(b.customerName)} | 📧 ${escapeHtml(b.customerEmail)} | 📞 ${escapeHtml(b.customerPhone)}
                        ${b.notes ? `<br>📝 <strong>Note:</strong> <em>"${escapeHtml(b.notes)}"</em>` : ''}
                        ${b.extraDegustazione ? `<br>🍷 <strong>Extra:</strong> Degustazione inclusa` : ''}
                    </div>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
                        <button class="btn-primary btn-small" style="background-color: #25d366;" onclick="apriChatWhatsAppCliente('${escapeHtml(b.customerPhone)}', '${escapeHtml(b.customerName)}', '${escapeHtml(b.tourTitle)}')">💬 Chatta su WhatsApp</button>
                        <button class="btn-secondary btn-small" style="background-color: #10b981;" onclick="cambiaStatoPrenotazione('${b.id}', 'Confermata')">✅ Conferma</button>
                        <button class="btn-secondary btn-small" style="background-color: #f59e0b;" onclick="cambiaStatoPrenotazione('${b.id}', 'Cancellata')">⚠️ Annulla</button>
                        <button class="btn-danger btn-small" onclick="eliminaPrenotazioneAdmin('${b.id}')">🗑️ Elimina</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function apriChatWhatsAppCliente(telefono, nome, tour) {
    const cleanNum = telefono.replace(/[^0-9]/g, '');
    const msg = `Ciao ${nome}! Ti contattiamo da Sicily Palermo Tour riguardo la tua prenotazione per il tour "${tour}".`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

function cambiaStatoPrenotazione(id, nuovoStato) {
    try {
        let bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
        bookings = bookings.map(b => {
            if (String(b.id) === String(id)) {
                b.status = nuovoStato;
            }
            return b;
        });
        localStorage.setItem('spt_bookings', JSON.stringify(bookings));
        caricaPrenotazioniAdmin();
    } catch (e) {
        console.error(e);
    }
}

function eliminaPrenotazioneAdmin(id) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;
    try {
        let bookings = JSON.parse(localStorage.getItem('spt_bookings') || '[]');
        bookings = bookings.filter(b => String(b.id) !== String(id));
        localStorage.setItem('spt_bookings', JSON.stringify(bookings));
        caricaPrenotazioniAdmin();
    } catch (e) {
        console.error(e);
    }
}
