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

// Gestione Sfondo Copertina Hero (Foto Ufficiale unificata e scorrevole)
function avviaHeroBgSlider() {
    const sliderBox = document.getElementById('hero-bg-slider');
    if (!sliderBox) return;

    let savedPhotos = [];
    try {
        savedPhotos = JSON.parse(localStorage.getItem('spt_hero_photos') || '[]');
    } catch (e) {}

    if (savedPhotos && savedPhotos.length > 0) {
        sliderBox.innerHTML = savedPhotos.map((url, i) => `
            <div class="hero-slide ${i === 0 ? 'active' : ''}">
                <img src="${url}" alt="Copertina Tour" style="width:100%; height:100%; object-fit:cover; object-position: center 35%;">
            </div>
        `).join('');
    } else {
        const defaultPhotos = [
            // Foto 2 (Alta Risoluzione)
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkPa80fb7bWzzi0MNJyxopYrebJqu3gP-LZCKNRZpABdTfSB88N6THhmQb0rt8dxBGARxBqdgpUBfcUhXhoSa2YQ3Ff4VbKIgMG3B4zlJ3t1Z9ca4fx-DpDYsTkt2fD2b4S5Yn9Xw=s1600-w1600-h1200-rw',
            // Foto 3 (Alta Risoluzione)
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkMGPV26BT3RCm8a24p-Lq3TQqh0q8vIFFbpm18Qu4aa8cf39Nh_jMCFnWLylGRUhHMb49rFd76ZI845PQ33RXIxBHK8WOQ6ghhCzQct9FViQEnJwbrRgsx36aa3qHueLj67lA95w=s1600-w1600-h1200-rw',
            // Foto 5 (Alta Risoluzione)
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkMEu9jf65pXTAwJzsiDkigvj1bC-BmDUox7HtegL_cET6H47xZ50quaBWPE57qGqtwizB4KAfpyfNbWSX8EKpqMnoUfvSUonWELfU7GV7h2bI2zb5lKyOBRRQTDqL0x2_Djk2Qdw=s1600-w1600-h1200-rw',
            // Foto 7 (Scala dei Turchi)
            'https://www.sicilia.info/wp-content/uploads/sites/91/scala-dei-turchi-hd.jpg',
            // Foto 8 (Alta Risoluzione)
            'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkd6Df7P4KVpNkdGj0jXxT2XAi45tU9zhkQ4JKIQNatgYnar92eCIShP7geZGsjhrKB8NAsb5NQj6edq3rPBLUrU_ipeSh_ncYcD_svY4uf0qo2nr7toOTiklPFuHnC5gwuxDB_=s1600-w1600-h1200-rw',
            // Foto 9 (San Vito lo Capo)
            'https://www.mooway.it/public/1621965619-vedere-sanvito-1.jpg'
        ];
        sliderBox.innerHTML = defaultPhotos.map((url, i) => `
            <div class="hero-slide ${i === 0 ? 'active' : ''}">
                <img src="${url}" alt="Sicily Palermo Tour Foto ${i + 1}" style="width:100%; height:100%; object-fit:cover; object-position: center 35%;">
            </div>
        `).join('');
    }

    const slides = document.querySelectorAll('.hero-slide');
    if (!slides || slides.length <= 1) return;

    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// Gestione Form Contatti (Invio Reale via Brevo all'Email Amministratore)
async function inviaMessaggio(event) {
    event.preventDefault();

    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const messaggioInput = document.getElementById('messaggio');

    const nome = nomeInput ? nomeInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const messaggio = messaggioInput ? messaggioInput.value.trim() : '';

    if (nome && email && messaggio) {
        if (window.brevoEmailService) {
            await window.brevoEmailService.inviaEmailMessaggioContatto(nome, email, messaggio);
        }
        alert(`🎉 Grazie ${nome}! Il tuo messaggio è stato spedito all'amministratore.\n\nTi risponderemo al più presto all'indirizzo ${email}.`);
        document.getElementById('contactForm').reset();
    } else {
        alert('Per favore, compila tutti i campi obbligatori.');
    }
}
