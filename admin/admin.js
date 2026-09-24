/**
 * MAIN ADMIN ENTRY POINT - Sicily Palermo Tour
 * Collega i 3 moduli delle Schede Admin:
 * 1) admin-itinerari.js    (Gestione Itinerari, Orari, Foto, Tappe)
 * 2) admin-prenotazioni.js (Gestione Lista Prenotazioni, Filtri, WhatsApp)
 * 3) admin-impostazioni.js  (Impostazioni Sito e Numero WhatsApp)
 */

const AUTH_KEY_MAIN = 'spt_admin_logged_in';
const AUTHORIZED_EMAIL_MAIN = 'pilotaintour13@gmail.com';

// INIZIALIZZAZIONE ALL'AVVIO
document.addEventListener('DOMContentLoaded', () => {
    verificaStatoAutenticazione();

    if (typeof caricaNumeroWhatsApp === 'function') caricaNumeroWhatsApp();
    if (typeof renderCampiTappe === 'function') renderCampiTappe();
    if (typeof renderCampiOrari === 'function') renderCampiOrari();
});

// LOGIN E AUTENTICAZIONE RISERVATA A PILOTAINTOR13@GMAIL.COM
function effettuaLogin(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById('admin-email');
    const loginError = document.getElementById('login-error');

    if (!emailInput) return;

    const email = emailInput.value.trim().toLowerCase();

    if (email === AUTHORIZED_EMAIL_MAIN.toLowerCase()) {
        localStorage.setItem('spt_admin_email', AUTHORIZED_EMAIL_MAIN);
        localStorage.setItem(AUTH_KEY_MAIN, 'true');
        if (loginError) loginError.classList.add('hidden');
        verificaStatoAutenticazione();
    } else {
        if (loginError) {
            loginError.classList.remove('hidden');
            loginError.textContent = `Accesso negato: L'email "${email}" non è autorizzata come Amministratore.`;
        }
    }
}

function logout() {
    localStorage.removeItem(AUTH_KEY_MAIN);
    localStorage.removeItem('spt_admin_email');
    verificaStatoAutenticazione();
}

function verificaStatoAutenticazione() {
    // Inizializza automaticamente l'accesso diretto per pilotaintour13@gmail.com
    if (!localStorage.getItem('spt_admin_email')) {
        localStorage.setItem('spt_admin_email', AUTHORIZED_EMAIL_MAIN);
    }
    if (localStorage.getItem(AUTH_KEY_MAIN) !== 'true') {
        localStorage.setItem(AUTH_KEY_MAIN, 'true');
    }

    const savedEmail = (localStorage.getItem('spt_admin_email') || AUTHORIZED_EMAIL_MAIN).toLowerCase();
    const isLoggedIn = localStorage.getItem(AUTH_KEY_MAIN) === 'true';

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userControls = document.getElementById('user-controls');
    const welcomeMsg = document.getElementById('welcome-msg');

    if (isLoggedIn && savedEmail === AUTHORIZED_EMAIL_MAIN.toLowerCase()) {
        if (loginSection) loginSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (userControls) userControls.classList.remove('hidden');
        if (welcomeMsg) {
            welcomeMsg.textContent = `👤 Admin: ${AUTHORIZED_EMAIL_MAIN}`;
        }
        if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    } else {
        if (loginSection) loginSection.classList.remove('hidden');
        if (dashboardSection) dashboardSection.classList.add('hidden');
        if (userControls) userControls.classList.add('hidden');
    }
}
        if (userControls) userControls.classList.add('hidden');
    }
}

// PASSAGGIO TRA SCHEDE (TABS)
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
        if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
    } else if (sezioneId === 'sezione-prenotazioni') {
        if (sezionePrenotazioni) sezionePrenotazioni.classList.remove('hidden');
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    } else if (sezioneId === 'sezione-impostazioni') {
        if (sezioneImpostazioni) sezioneImpostazioni.classList.remove('hidden');
    }
}
