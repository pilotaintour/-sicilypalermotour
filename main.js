/**
 * Logica Principale di Inizializzazione e Contatti - Sicily Palermo Tour
 */

const AUTHORIZED_EMAIL = 'pilotaintour13@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
    // Avvia il carosello sfondi della copertina Hero
    avviaHeroBgSlider();

    // Carica gli itinerari nella Home
    if (typeof caricaItinerari === 'function') {
        caricaItinerari();
    }

    // Riconoscimento dinamico dell'amministratore: MOSTRA il tasto Admin SOLO sul browser dell'amministratore autenticato
    const savedEmail = (localStorage.getItem('spt_admin_email') || '').toLowerCase();
    const isLoggedIn = localStorage.getItem('spt_admin_logged_in') === 'true';

    if (isLoggedIn && savedEmail === AUTHORIZED_EMAIL.toLowerCase()) {
        const navSlot = document.getElementById('nav-admin-slot');
        const footerSlot = document.getElementById('footer-admin-slot');

        if (navSlot) {
            navSlot.innerHTML = `<a href="admin/index.html" target="_blank" class="nav-admin">⚙️ Area Gestione Admin</a>`;
        }
        if (footerSlot) {
            footerSlot.innerHTML = `| <a href="admin/index.html" target="_blank" style="color: #e67e22; text-decoration: none; font-weight: bold;">⚙️ Area Gestione Admin</a>`;
        }
    }

    // Sincronizzazione automatica se l'admin aggiorna gli itinerari in un'altra scheda
    window.addEventListener('storage', (e) => {
        if (e.key === 'spt_itineraries' && typeof caricaItinerari === 'function') {
            caricaItinerari(typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti');
        }
    });
});

// Carosello Sfondo Scorrevoli della Copertina (Hero Slider)
function avviaHeroBgSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides || slides.length <= 1) return;

    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// Gestione Form Contatti
function inviaMessaggio(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const messaggio = document.getElementById('messaggio').value.trim();

    if (nome && email && messaggio) {
        alert(`Grazie ${nome}! Il tuo messaggio è stato inviato con successo. Ti risponderemo presto all'indirizzo ${email}.`);
        document.getElementById('contactForm').reset();
    } else {
        alert('Per favore, compila tutti i campi obbligatori.');
    }
}
