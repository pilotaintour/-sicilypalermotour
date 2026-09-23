/**
 * Gestione Dati e Rendering Itinerari con Carosello Foto e Timeline Tappe - Sicily Palermo Tour
 */

const STORAGE_KEY = 'spt_itineraries';

// Traccia l'indice della foto corrente nel carosello per ciascun tour
const indiciCarosello = {};

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
        servizi: ['Guida Locale Esperta', 'Assistenza Personalizzata', 'Adatto a Famiglie', 'Cancellazione Gratuita'],
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

let itinerarioSelezionatoAttuale = null;
let categoriaSelezionata = 'Tutti';

// Recupera gli itinerari aggiornati dal localStorage
function getItinerari() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITINERARIES));
        return DEFAULT_ITINERARIES;
    }
    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ITINERARIES;
    } catch (e) {
        return DEFAULT_ITINERARIES;
    }
}

// Genera l'HTML del Carosello Foto per una card o per la modale
function generaHtmlCarosello(tour, prefissoId = 'card') {
    const fotoList = (tour.images && tour.images.length > 0) ? tour.images : [tour.imageUrl || 'https://via.placeholder.com/400x220?text=Palermo+Tour'];
    const tourId = tour.id;

    if (!indiciCarosello[prefissoId + '_' + tourId]) {
        indiciCarosello[prefissoId + '_' + tourId] = 0;
    }

    const currentIndex = indiciCarosello[prefissoId + '_' + tourId];
    const currentImg = fotoList[currentIndex] || fotoList[0];
    const haPiuFoto = fotoList.length > 1;

    let html = `
        <div class="card-img-container" id="${prefissoId}-container-${tourId}">
            <img class="carousel-img" id="${prefissoId}-img-${tourId}" src="${currentImg}" alt="${escapeHtml(tour.title)}" onerror="this.src='https://via.placeholder.com/400x220?text=Foto+Tour'">
    `;

    if (haPiuFoto) {
        html += `
            <button type="button" class="carousel-nav-btn prev" onclick="scorriCarosello('${tourId}', -1, '${prefissoId}', event)" title="Foto precedente">❮</button>
            <button type="button" class="carousel-nav-btn next" onclick="scorriCarosello('${tourId}', 1, '${prefissoId}', event)" title="Foto successiva">❯</button>
            <div class="carousel-dots">
                ${fotoList.map((_, i) => `
                    <span class="carousel-dot ${i === currentIndex ? 'active' : ''}" onclick="vaiAFotoIndex('${tourId}', ${i}, '${prefissoId}', event)"></span>
                `).join('')}
            </div>
        `;
    }

    html += `</div>`;
    return html;
}

// Scorre le foto del carosello
function scorriCarosello(tourId, direzione, prefissoId = 'card', event) {
    if (event) event.stopPropagation();

    const itinerari = getItinerari();
    const tour = itinerari.find(t => String(t.id) === String(tourId));
    if (!tour) return;

    const fotoList = (tour.images && tour.images.length > 0) ? tour.images : [tour.imageUrl];
    const key = prefissoId + '_' + tourId;

    if (typeof indiciCarosello[key] === 'undefined') {
        indiciCarosello[key] = 0;
    }

    let nextIndex = indiciCarosello[key] + direzione;
    if (nextIndex < 0) {
        nextIndex = fotoList.length - 1;
    } else if (nextIndex >= fotoList.length) {
        nextIndex = 0;
    }

    indiciCarosello[key] = nextIndex;
    aggiornaVistaCarosello(tourId, prefissoId, fotoList, nextIndex);
}

// Salta direttamente a un'immagine del carosello tramite pallino
function vaiAFotoIndex(tourId, index, prefissoId = 'card', event) {
    if (event) event.stopPropagation();

    const itinerari = getItinerari();
    const tour = itinerari.find(t => String(t.id) === String(tourId));
    if (!tour) return;

    const fotoList = (tour.images && tour.images.length > 0) ? tour.images : [tour.imageUrl];
    const key = prefissoId + '_' + tourId;

    indiciCarosello[key] = index;
    aggiornaVistaCarosello(tourId, prefissoId, fotoList, index);
}

// Aggiorna l'immagine e i pallini attivi
function aggiornaVistaCarosello(tourId, prefissoId, fotoList, newIndex) {
    const imgElement = document.getElementById(`${prefissoId}-img-${tourId}`);
    if (imgElement) {
        imgElement.style.opacity = '0.3';
        setTimeout(() => {
            imgElement.src = fotoList[newIndex];
            imgElement.style.opacity = '1';
        }, 150);
    }

    const container = document.getElementById(`${prefissoId}-container-${tourId}`);
    if (container) {
        const dots = container.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            if (i === newIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// Carica e renderizza la griglia degli itinerari
function caricaItinerari(categoria = 'Tutti') {
    categoriaSelezionata = categoria;
    const itinerari = getItinerari();
    const grid = document.getElementById('itinerari-grid');

    if (!grid) return;

    const filtrati = categoria === 'Tutti'
        ? itinerari
        : itinerari.filter(i => i.category === categoria);

    if (filtrati.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                <h3>Nessun itinerario trovato per la categoria "${escapeHtml(categoria)}"</h3>
                <p>Prova a selezionare una categoria diversa o torna tra poco!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtrati.map(tour => `
        <div class="card">
            ${generaHtmlCarosello(tour, 'card')}
            <div class="card-content">
                <div class="badges-row">
                    <span class="badge">${escapeHtml(tour.category)}</span>
                    ${tour.images && tour.images.length > 1 ? `<span class="badge" style="background:#e0f2fe; color:#0369a1;">📷 ${tour.images.length} Foto</span>` : ''}
                    ${String(tour.featured) === 'true' ? '<span class="badge badge-star">⭐ In Evidenza</span>' : ''}
                </div>
                <h3>${escapeHtml(tour.title)}</h3>
                <div class="card-meta">
                    <span>⏱️ ${escapeHtml(tour.duration || 'Flessibile')}</span>
                    <span>💰 ${escapeHtml(tour.price || 'Su richiesta')}</span>
                </div>
                <div class="card-desc">${escapeHtml(tour.shortDesc)}</div>
                <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                    <button type="button" class="btn-tour" style="flex: 1; min-width: 140px;" onclick="apriDettagliModal('${tour.id}')">Dettagli & Tappe →</button>
                    <button type="button" class="btn-secondary" style="background: #1b4f72; color: #ffffff; border: none; padding: 10px 14px; border-radius: 8px; font-weight: bold; cursor: pointer;" onclick="vaiAllaPaginaPrenotazione('${tour.id}')">📅 Prenota</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Gestione dei bottoni filtro categoria
function filtraCategoria(categoria, btnElement) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    caricaItinerari(categoria);
}

// Apre la finestra modale con le tappe e il carosello dell'itinerario
function apriDettagliModal(id) {
    try {
        const itinerari = getItinerari();
        const tour = itinerari.find(t => String(t.id) === String(id)) || itinerari[0];

        if (!tour) return;

        itinerarioSelezionatoAttuale = tour;

        // Renderizza il carosello nella modale
        const modalCoverBox = document.getElementById('modal-cover-box');
        if (modalCoverBox) {
            modalCoverBox.innerHTML = generaHtmlCarosello(tour, 'modal');
        }

        const badgeEl = document.getElementById('modal-badge');
        if (badgeEl) badgeEl.textContent = tour.category || 'Tour';

        const featuredBadge = document.getElementById('modal-featured');
        if (featuredBadge) {
            if (String(tour.featured) === 'true') {
                featuredBadge.classList.remove('hidden');
            } else {
                featuredBadge.classList.add('hidden');
            }
        }

        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.textContent = tour.title || '';

        // Popola Box Dettagli Pratici
        const durationEl = document.getElementById('modal-duration');
        const priceEl = document.getElementById('modal-price');
        const meetingEl = document.getElementById('modal-meeting');

        if (durationEl) durationEl.textContent = tour.duration || 'Flessibile';
        if (priceEl) priceEl.textContent = tour.price || 'Su richiesta';
        if (meetingEl) meetingEl.textContent = tour.meetingPoint || 'Palermo Centro';

        // Binda il pulsante di prenotazione con calendario
        const btnCalFooter = document.getElementById('btn-modal-prenota-calendario');
        if (btnCalFooter) {
            btnCalFooter.onclick = () => vaiAllaPaginaPrenotazione(tour.id);
        }

        // Genera la Timeline delle Tappe
        const modalTimeline = document.getElementById('modal-timeline');
        const modalDescText = document.getElementById('modal-description-text');

        if (modalDescText) {
            modalDescText.textContent = tour.fullDesc || tour.shortDesc || '';
        }

        if (modalTimeline) {
            let tappeList = [];
            if (tour.tappe && Array.isArray(tour.tappe) && tour.tappe.length > 0) {
                tappeList = tour.tappe;
            } else {
                // Parsea righe numerate dalla descrizione se presenti
                const fullText = tour.fullDesc || tour.shortDesc || '';
                const righe = fullText.split('\n').filter(r => r.trim() !== '');
                righe.forEach(riga => {
                    const trimmed = riga.trim();
                    if (/^(\d+[\.\)-]|-|\*)/.test(trimmed)) {
                        const pulita = trimmed.replace(/^(\d+[\.\)-]|-|\*)\s*/, '');
                        if (pulita) tappeList.push(pulita);
                    }
                });
            }

            if (tappeList.length > 0) {
                modalTimeline.innerHTML = tappeList.map((tappa, idx) => `
                    <div class="timeline-step">
                        <span class="step-number">${idx + 1}</span>
                        <span class="step-text">${escapeHtml(tappa)}</span>
                    </div>
                `).join('');
            } else {
                modalTimeline.innerHTML = `
                    <div class="timeline-step">
                        <span class="step-number">1</span>
                        <span class="step-text">Incontro con la guida e partenza per il tour "${escapeHtml(tour.title || '')}"</span>
                    </div>
                    <div class="timeline-step">
                        <span class="step-number">2</span>
                        <span class="step-text">Passeggiata tra i luoghi storici, monumenti e punti di interesse del percorso</span>
                    </div>
                    <div class="timeline-step">
                        <span class="step-number">3</span>
                        <span class="step-text">Conclusione dell'itinerario e consigli personalizzati su cosa visitare a Palermo</span>
                    </div>
                `;
            }
        }

        // Renderizza Chips Servizi Inclusi
        const servicesBox = document.getElementById('modal-services-box');
        if (servicesBox) {
            const listaServizi = (tour.servizi && tour.servizi.length > 0)
                ? tour.servizi
                : ['Guida Locale Esperta', 'Assistenza Personalizzata', 'Adatto a Famiglie', 'Cancellazione Gratuita'];

            servicesBox.innerHTML = listaServizi.map(s => `
                <span class="service-chip">✓ ${escapeHtml(s)}</span>
            `).join('');
        }

        const modalOverlay = document.getElementById('modal-dettaglio');
        if (modalOverlay) {
            modalOverlay.classList.remove('hidden');
            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    } catch (err) {
        console.error("Errore nell'apertura della modale:", err);
    }
}

// Chiude la finestra modale
function chiudiModal(event) {
    const modal = document.getElementById('modal-dettaglio');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Reindirizza alla pagina di prenotazione completa con calendario
function vaiAllaPaginaPrenotazione(id) {
    const tourId = id || (itinerarioSelezionatoAttuale ? itinerarioSelezionatoAttuale.id : '1');
    window.location.href = `prenotazioni/prenotazione.html?tourId=${encodeURIComponent(tourId)}`;
}

// Precompila il form di contatto dalla modale
function prenotaTourModal() {
    if (!itinerarioSelezionatoAttuale) return;

    chiudiModal();

    const messaggioInput = document.getElementById('messaggio');
    if (messaggioInput) {
        messaggioInput.value = `Salve! Desidero maggiori informazioni o prenotare l'itinerario: "${itinerarioSelezionatoAttuale.title}".`;
    }

    const contattiSection = document.getElementById('contatti');
    if (contattiSection) {
        contattiSection.scrollIntoView({ behavior: 'smooth' });
    }
    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.focus();
    }
}

// Helper sicurezza HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#032;");
}
