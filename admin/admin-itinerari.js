/**
 * MODULO 1: Gestione Itinerari, Orari a 15 Minuti, Foto & Tappe
 * Sicily Palermo Tour - Admin
 */

const STORAGE_KEY = 'spt_itineraries';
const AUTH_KEY = 'spt_admin_logged_in';
const AUTHORIZED_EMAIL = 'pilotaintour13@gmail.com';

let fotoItinerarioCorrenti = [];
let tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti storici'];
let orariCorrenti = [
    { time: '09:30', capacity: 15 },
    { time: '11:30', capacity: 15 },
    { time: '15:30', capacity: 15 },
    { time: '18:00', capacity: 15 }
];

const DEFAULT_ITINERARIES = [];

function pulisciVecchiItinerariDemo(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.filter(item => {
        if (!item) return false;
        const title = (item.title || '').trim().toLowerCase();
        const id = String(item.id || '');
        const isOld1 = (id === '1' || title.includes('arabo-normanna'));
        const isOld2 = (id === '2' || title.includes('tour del gusto') || title.includes('street food'));
        const isOld3 = (id === '3' || title.includes('mondello e il barocco'));
        return !(isOld1 || isOld2 || isOld3);
    });
}

// RECUPERO ITINERARI
function getItinerari() {
    let saved = localStorage.getItem(STORAGE_KEY);
    let list = null;
    if (saved) {
        try {
            list = JSON.parse(saved);
        } catch (e) {
            list = [];
        }
    }
    return (list && Array.isArray(list)) ? pulisciVecchiItinerariDemo(list) : [];
}

async function saveItinerari(itinerari) {
    const cleanList = pulisciVecchiItinerariDemo(itinerari);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));

    if (window.cloudAdmin && window.cloudAdmin.isAuthorized()) {
        await window.cloudAdmin.salvaItinerariAdmin(cleanList);
    } else if (window.cloudDB) {
        await window.cloudDB.salvaItinerariCloud(cleanList);
    }
}

function caricaElencoItinerari() {
    const itinerari = getItinerari();
    const container = document.getElementById('itineraries-list');
    const countBadge = document.getElementById('itinerary-count');

    if (!container) return;

    if (countBadge) countBadge.textContent = itinerari.length;

    if (!itinerari || itinerari.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">Nessun itinerario presente.</p>';
        return;
    }

    try {
        container.innerHTML = itinerari.map(item => {
            const coverImg = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || 'https://via.placeholder.com/90?text=Palermo');
            const totalPhotos = (item.images && item.images.length > 0) ? item.images.length : (item.imageUrl ? 1 : 0);
            const totalOrari = (item.timeSlots && item.timeSlots.length > 0) ? item.timeSlots.length : 0;

            return `
                <div class="itinerary-item">
                    <img class="item-thumb" src="${coverImg}" alt="${escapeHtmlAdmin(item.title)}" onerror="this.src='https://via.placeholder.com/90?text=Foto'">
                    <div class="item-content">
                        <span class="item-badge">${escapeHtmlAdmin(item.category)}</span>
                        <span class="item-badge" style="background:#e0f2fe; color:#0369a1;">🖼️ ${totalPhotos} Foto</span>
                        <span class="item-badge" style="background:#fef3c7; color:#92400e;">⏰ ${totalOrari} Orari Attivi</span>
                        ${item.featured === 'true' ? '<span class="item-badge" style="background:#dbeafe; color:#1e40af;">⭐ Evidenza</span>' : ''}
                        <div class="item-title">${escapeHtmlAdmin(item.title)}</div>
                        <div class="item-meta">⏱️ ${escapeHtmlAdmin(item.duration || 'N/D')} | 💰 ${escapeHtmlAdmin(item.price || 'N/D')}</div>
                        <div class="item-desc">${escapeHtmlAdmin(item.shortDesc)}</div>
                    </div>
                    <div class="item-actions">
                        <button type="button" class="btn-secondary btn-small" onclick="preparaModifica('${item.id}')">✏️ Edit</button>
                        <button type="button" class="btn-danger btn-small" onclick="eliminaItinerario('${item.id}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Errore rendering itinerari:", err);
    }
}

async function salvaItinerario(event) {
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

    const tappe = tappeCorrenti.map(t => t.trim()).filter(t => t !== '');

    const serviziChecks = document.querySelectorAll('input[name="servizio-check"]:checked');
    const servizi = Array.from(serviziChecks).map(c => c.value);

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
        itinerari = itinerari.map(item => {
            if (String(item.id) === String(id)) {
                return { id, title, category, duration, price, meetingPoint, timeSlots, maxCapacity, featured, imageUrl, images, tappe, servizi, shortDesc, fullDesc };
            }
            return item;
        });
    } else {
        const nuovoItinerario = {
            id: Date.now().toString(),
            title, category, duration, price, meetingPoint, timeSlots, maxCapacity, featured, imageUrl, images, tappe, servizi, shortDesc, fullDesc
        };
        itinerari.unshift(nuovoItinerario);
    }

    saveItinerari(itinerari);

    if (window.cloudDB) {
        await window.cloudDB.salvaItinerariCloud(itinerari);
    }

    alert('☁️ Itinerario salvato e pubblicato sul Cloud per tutti i turisti!');
    resetForm();
    caricaElencoItinerari();
}

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

    if (item.tappe && item.tappe.length > 0) {
        tappeCorrenti = [...item.tappe];
    } else {
        tappeCorrenti = ['Incontro con la guida'];
    }
    renderCampiTappe();

    if (item.timeSlots && item.timeSlots.length > 0) {
        orariCorrenti = [...item.timeSlots];
    } else {
        orariCorrenti = [
            { time: '09:30', capacity: 15 },
            { time: '11:30', capacity: 15 },
            { time: '15:30', capacity: 15 },
            { time: '18:00', capacity: 15 }
        ];
    }
    renderCampiOrari();

    const serviziChecks = document.querySelectorAll('input[name="servizio-check"]');
    serviziChecks.forEach(c => {
        c.checked = item.servizi ? item.servizi.includes(c.value) : true;
    });

    if (item.images && item.images.length > 0) {
        fotoItinerarioCorrenti = [...item.images];
    } else if (item.imageUrl) {
        fotoItinerarioCorrenti = [item.imageUrl];
    } else {
        fotoItinerarioCorrenti = [];
    }

    renderGalleriaAnteprima();

    document.getElementById('form-title').textContent = '✏️ Modifica Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Modifiche';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
}

function annullaModifica() {
    resetForm();
}

function resetForm() {
    document.getElementById('itineraryForm').reset();
    document.getElementById('itinerary-id').value = '';
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
    fotoItinerarioCorrenti = [];
    tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti'];
    orariCorrenti = [
        { time: '09:30', capacity: 15 },
        { time: '11:30', capacity: 15 },
        { time: '15:30', capacity: 15 },
        { time: '18:00', capacity: 15 }
    ];
    renderGalleriaAnteprima();
    renderCampiTappe();
    renderCampiOrari();
    document.getElementById('form-title').textContent = '➕ Aggiungi Nuovo Itinerario';
    document.getElementById('save-btn').textContent = '💾 Salva Itinerario';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

async function eliminaItinerario(id) {
    if (!confirm('Sei sicuro di voler eliminare questo itinerario?')) return;

    let itinerari = getItinerari();
    itinerari = itinerari.filter(i => String(i.id) !== String(id));
    await saveItinerari(itinerari);

    if (String(document.getElementById('itinerary-id').value) === String(id)) {
        resetForm();
    }

    caricaElencoItinerari();
}

async function resetDemoData() {
    if (confirm('Sei sicuro di voler SBUOTARE e cancellare tutti gli itinerari presente?')) {
        await saveItinerari([]);
        resetForm();
        caricaElencoItinerari();
    }
}

async function pubblicaItinerariNelCloudManuale() {
    const itinerari = getItinerari();
    if (!itinerari || itinerari.length === 0) {
        alert("Nessun itinerario presente da pubblicare.");
        return;
    }

    if (window.cloudDB) {
        const ok = await window.cloudDB.salvaItinerariCloud(itinerari);
        if (ok) {
            alert(`☁️ TUTTI I ${itinerari.length} ITINERARI SONO STATI PUBBLICATI NEL CLOUD CON SUCCESSO!\n\nOra qualsiasi turista da qualsiasi cellulare, tablet o computer nel mondo vedrà i tuoi itinerari aggiornati.`);
        } else {
            alert("⚠️ Si è verificato un problema nella pubblicazione Cloud. Verifica la tua connessione internet.");
        }
    }
}

// TABELLA ORARI MODALE
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

    const chipsContainer = document.getElementById('orari-active-chips');
    if (chipsContainer) {
        if (orariCorrenti.length === 0) {
            chipsContainer.innerHTML = '<span style="font-size:0.85rem; color:#94a3b8;">Nessun orario selezionato. Clicca su "Seleziona Orari dalla Tabella" per aggiungerli!</span>';
        } else {
            chipsContainer.innerHTML = orariCorrenti.map((item, idx) => `
                <span style="background: #e0f2fe; border: 1.5px solid #bae6fd; color: #0369a1; padding: 6px 12px; border-radius: 20px; font-size: 0.88rem; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    ⏰ <strong>${escapeHtmlAdmin(item.time)}</strong>
                    <input type="number" min="1" max="500" value="${item.capacity}" onchange="aggiornaCapienzaOrario(${idx}, this.value)" style="width: 52px; padding: 2px 4px; border: 1px solid #0369a1; border-radius: 6px; font-weight: bold; text-align: center; color: #0369a1; background: #ffffff; font-size: 0.82rem;" title="Modifica capienza per questo orario">
                    <span style="font-size: 0.78rem; opacity: 0.9;">pers.</span>
                    <button type="button" onclick="toggleOrario('${item.time}')" style="background: transparent; border: none; color: #0369a1; font-weight: bold; cursor: pointer; padding: 0 2px; font-size: 0.9rem;" title="Rimuovi orario">✕</button>
                </span>
            `).join('');
        }
    }

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

function aggiornaCapienzaOrario(index, nuovaCapienza) {
    if (orariCorrenti[index]) {
        orariCorrenti[index].capacity = parseInt(nuovaCapienza, 10) || 15;
        renderCampiOrari();
    }
}

function applicaPresetOrari(tipo) {
    if (tipo === 'reset') {
        orariCorrenti = [];
        renderCampiOrari();
    }
}

// BUILDER FOTO & TAPPE
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
                    event.target.value = '';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

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

function rimuoviFotoGalleria(index) {
    fotoItinerarioCorrenti.splice(index, 1);
    renderGalleriaAnteprima();
}

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

function renderCampiTappe() {
    const container = document.getElementById('tappe-input-list');
    if (!container) return;

    if (tappeCorrenti.length === 0) {
        tappeCorrenti = ['Incontro con la guida', 'Passeggiata tra i monumenti storici'];
    }

    container.innerHTML = tappeCorrenti.map((tappaText, idx) => `
        <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-weight: bold; font-size: 0.85rem; color: #e67e22; width: 24px; text-align: center;">${idx + 1}.</span>
            <input type="text" class="tappa-input" value="${escapeHtmlAdmin(tappaText)}" placeholder="Es. Tappa ${idx + 1}" oninput="aggiornaTappa(${idx}, this.value)" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
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
    setTimeout(() => {
        const inputs = document.querySelectorAll('.tappa-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
}

function rimuoviCampoTappa(index) {
    tappeCorrenti.splice(index, 1);
    renderCampiTappe();
}

function escapeHtmlAdmin(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#032;");
}
