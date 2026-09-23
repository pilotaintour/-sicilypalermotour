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
        featured: 'true',
        imageUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800',
            'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=800',
            'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800'
        ],
        shortDesc: 'Visita la Cattedrale, il Palazzo dei Normanni e la meravigliosa Cappella Palatina, patrimonio UNESCO.',
        fullDesc: 'Un viaggio straordinario nel cuore di Palermo tra architetture uniche al mondo.\n\nTappe principali:\n1. Cattedrale di Palermo\n2. Palazzo dei Normanni e Cappella Palatina\n3. Chiesa di San Giovanni degli Eremiti\n4. Quattro Canti e Piazza Pretoria.'
    },
    {
        id: '2',
        title: 'Tour del Gusto e Street Food',
        category: 'Street Food',
        duration: '2.5 Ore',
        price: 'Da 20€',
        featured: 'true',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800'
        ],
        shortDesc: 'Esplora i mercati storici di Ballarò e del Capo assaggiando panelle, crocchè e il pane con la milza.',
        fullDesc: 'Vivi l\'esperienza gastronomica palermitana autentica nei vicoli e tra i banchi dei mercati secolari.\n\nAssaggerai:\n1. Panelle e Crocchè calde\n2. Sfincione palermitano artigianale\n3. Pane con la milza (per i più audaci)\n4. Cannolo siciliano con ricotta fresca.'
    },
    {
        id: '3',
        title: 'Mondello e il Barocco',
        category: 'Mare e Natura',
        duration: 'Mezza Giornata',
        price: 'Da 30€',
        featured: 'false',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'
        ],
        shortDesc: 'Rilassati sulla spiaggia dorata di Mondello e ammira le splendide ville Liberty e il centro barocco.',
        fullDesc: 'Dalla costa cristallina alla bellezza architettonica Liberty del borgo marinaro di Mondello.\n\nTappe e Momenti:\n1. Passeggiata sul lungomare di Mondello\n2. Ammirare le Ville Liberty e dello Stabilimento Balneare\n3. Sosta per gelato artigianale o granita siciliana\n4. Rientro panoramico verso Palermo.'
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
        return JSON.parse(saved);
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
            <button class="carousel-nav-btn prev" onclick="scorriCarosello('${tourId}', -1, '${prefissoId}', event)" title="Foto precedente">❮</button>
            <button class="carousel-nav-btn next" onclick="scorriCarosello('${tourId}', 1, '${prefissoId}', event)" title="Foto successiva">❯</button>
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
    const tour = itinerari.find(t => t.id === tourId);
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
    const tour = itinerari.find(t => t.id === tourId);
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
                    ${tour.featured === 'true' ? '<span class="badge badge-star">⭐ In Evidenza</span>' : ''}
                </div>
                <h3>${escapeHtml(tour.title)}</h3>
                <div class="card-meta">
                    <span>⏱️ ${escapeHtml(tour.duration || 'Flessibile')}</span>
                    <span>💰 ${escapeHtml(tour.price || 'Su richiesta')}</span>
                </div>
                <div class="card-desc">${escapeHtml(tour.shortDesc)}</div>
                <button class="btn-tour" onclick="apriDettagliModal('${tour.id}')">Scopri Dettagli & Tappe →</button>
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
    const itinerari = getItinerari();
    const tour = itinerari.find(t => t.id === id);

    if (!tour) return;

    itinerarioSelezionatoAttuale = tour;

    // Renderizza il carosello nella modale
    const modalCoverBox = document.getElementById('modal-cover-box');
    if (modalCoverBox) {
        modalCoverBox.innerHTML = generaHtmlCarosello(tour, 'modal');
    }

    document.getElementById('modal-badge').textContent = tour.category;

    const featuredBadge = document.getElementById('modal-featured');
    if (tour.featured === 'true') {
        featuredBadge.classList.remove('hidden');
    } else {
        featuredBadge.classList.add('hidden');
    }

    document.getElementById('modal-title').textContent = tour.title;

    // Popola Box Dettagli Pratici
    const durationEl = document.getElementById('modal-duration');
    const priceEl = document.getElementById('modal-price');
    if (durationEl) durationEl.textContent = tour.duration || 'Flessibile';
    if (priceEl) priceEl.textContent = tour.price || 'Su richiesta';

    // Genera la Timeline delle Tappe partendo dalla descrizione
    const modalTimeline = document.getElementById('modal-timeline');
    const modalDescText = document.getElementById('modal-description-text');

    const fullText = tour.fullDesc || tour.shortDesc || '';
    const righe = fullText.split('\n').filter(r => r.trim() !== '');

    const tappeTrovate = [];
    let testoGenerale = [];

    righe.forEach(riga => {
        const trimmed = riga.trim();
        // Cerca se la riga comincia con un numero (es. "1.", "2-") o un trattino "-"
        if (/^(\d+[\.\)-]|-|\*)/.test(trimmed)) {
            const pulita = trimmed.replace(/^(\d+[\.\)-]|-|\*)\s*/, '');
            if (pulita) tappeTrovate.push(pulita);
        } else {
            testoGenerale.push(trimmed);
        }
    });

    if (modalDescText) {
        modalDescText.textContent = testoGenerale.join('\n\n') || tour.shortDesc;
    }

    if (modalTimeline) {
        if (tappeTrovate.length > 0) {
            modalTimeline.innerHTML = tappeTrovate.map((tappa, idx) => `
                <div class="timeline-step">
                    <span class="step-number">${idx + 1}</span>
                    <span class="step-text">${escapeHtml(tappa)}</span>
                </div>
            `).join('');
        } else {
            // Se non ci sono righe numerate, mostra tappe di default basate sul titolo
            modalTimeline.innerHTML = `
                <div class="timeline-step">
                    <span class="step-number">1</span>
                    <span class="step-text">Incontro con la guida e partenza per il tour "${escapeHtml(tour.title)}"</span>
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

    document.getElementById('modal-dettaglio').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Chiude la finestra modale
function chiudiModal(event) {
    const modal = document.getElementById('modal-dettaglio');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
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
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#032;");
}
