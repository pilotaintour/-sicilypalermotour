/**
 * Logica di interazione per Sicily Palermo Tour
 * Sincronizzata in tempo reale con l'Area Admin
 */

const STORAGE_KEY = 'spt_itineraries';

// Itinerari Iniziali Predefiniti di Fallback
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

let itinerarioSelezionatoAttuale = null;
let categoriaSelezionata = 'Tutti';

// Avvio all'apertura della pagina
document.addEventListener('DOMContentLoaded', () => {
    caricaItinerari();

    // Sincronizzazione automatica se l'admin modifica gli itinerari in un'altra scheda!
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            caricaItinerari(categoriaSelezionata);
        }
    });
});

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

// Carica e renderizza la griglia degli itinerari
function caricaItinerari(categoria = 'Tutti') {
    categoriaSelezionata = categoria;
    const itinerari = getItinerari();
    const grid = document.getElementById('itinerari-grid');

    if (!grid) return;

    // Filtra in base alla categoria scelta
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
            <div class="card-img-container">
                <img class="card-img" src="${tour.imageUrl || 'https://via.placeholder.com/400x200?text=Palermo+Tour'}" alt="${escapeHtml(tour.title)}" onerror="this.src='https://via.placeholder.com/400x200?text=Foto+Tour'">
            </div>
            <div class="card-content">
                <div class="badges-row">
                    <span class="badge">${escapeHtml(tour.category)}</span>
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
    // Gestione classe active sui bottoni
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    caricaItinerari(categoria);
}

// Apre la finestra modale con le tappe e i dettagli dell'itinerario
function apriDettagliModal(id) {
    const itinerari = getItinerari();
    const tour = itinerari.find(t => t.id === id);

    if (!tour) return;

    itinerarioSelezionatoAttuale = tour;

    document.getElementById('modal-img').src = tour.imageUrl || 'https://via.placeholder.com/600x300?text=Palermo+Tour';
    document.getElementById('modal-badge').textContent = tour.category;

    const featuredBadge = document.getElementById('modal-featured');
    if (tour.featured === 'true') {
        featuredBadge.classList.remove('hidden');
    } else {
        featuredBadge.classList.add('hidden');
    }

    document.getElementById('modal-title').textContent = tour.title;
    document.getElementById('modal-meta').innerHTML = `⏱️ <strong>Durata:</strong> ${escapeHtml(tour.duration || 'N/D')} &nbsp;|&nbsp; 💰 <strong>Info/Prezzo:</strong> ${escapeHtml(tour.price || 'N/D')}`;
    document.getElementById('modal-body').textContent = tour.fullDesc || tour.shortDesc;

    // Mostra Modal
    document.getElementById('modal-dettaglio').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Blocco scroll sotto
}

// Chiude la finestra modale
function chiudiModal(event) {
    const modal = document.getElementById('modal-dettaglio');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Ripristina scroll
}

// Precompila il form di contatto dalla modale
function prenotaTourModal() {
    if (!itinerarioSelezionatoAttuale) return;

    chiudiModal();

    const messaggioInput = document.getElementById('messaggio');
    messaggioInput.value = `Salve! Desidero maggiori informazioni o prenotare l'itinerario: "${itinerarioSelezionatoAttuale.title}".`;

    // Scroll fluido verso la sezione contatti
    document.getElementById('contatti').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('nome').focus();
}

// Gestione Form Contatti
function inviaMessaggio(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const messaggio = document.getElementById('messaggio').value.trim();

    if (nome && email && messaggio) {
        alert(`Grazie ${nome}! Il tuo messaggio è stato inviato con successo. Ti risponderemo presto a ${email}.`);
        document.getElementById('contactForm').reset();
    } else {
        alert('Per favore, compila tutti i campi obbligatori.');
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
