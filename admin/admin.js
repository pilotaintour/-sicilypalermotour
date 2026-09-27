/**
 * MAIN ADMIN ENTRY POINT - Sicily Palermo Tour
 * Controllo di Sicurezza Rigido: Riservato Esclusivamente a pilotaintour13@gmail.com
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

// LOGIN E AUTENTICAZIONE RISERVATA ESCLUSIVAMENTE A PILOTAINTOR13@GMAIL.COM
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
            loginError.textContent = `⛔ Accesso Negato: L'indirizzo "${email}" non è autorizzato. L'area di gestione è riservata esclusivamente all'amministratore.`;
        }
    }
}

function logout() {
    localStorage.removeItem(AUTH_KEY_MAIN);
    localStorage.removeItem('spt_admin_email');
    verificaStatoAutenticazione();
}

function verificaStatoAutenticazione() {
    const savedEmail = (localStorage.getItem('spt_admin_email') || '').toLowerCase();
    const isLoggedIn = localStorage.getItem(AUTH_KEY_MAIN) === 'true';

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userControls = document.getElementById('user-controls');
    const welcomeMsg = document.getElementById('welcome-msg');

    // Verifica la corrispondenza con l'email autorizzata pilotaintour13@gmail.com
    if (isLoggedIn && savedEmail === AUTHORIZED_EMAIL_MAIN.toLowerCase()) {
        if (loginSection) loginSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (userControls) userControls.classList.remove('hidden');
        if (welcomeMsg) {
            welcomeMsg.textContent = `👤 Admin: ${AUTHORIZED_EMAIL_MAIN}`;
        }

        if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
        if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
    } else {
        if (loginSection) loginSection.classList.remove('hidden');
        if (dashboardSection) dashboardSection.classList.add('hidden');
        if (userControls) userControls.classList.add('hidden');
    }
}

// PASSAGGIO TRA SCHEDE (TABS)
function mostraSezione(sezioneId, btnElement) {
    const sezioneItinerari = document.getElementById('sezione-itinerari');
    const sezionePrenotazioni = document.getElementById('sezione-prenotazioni');
    const sezioneImpostazioni = document.getElementById('sezione-impostazioni');
    const sezioneRecensioni = document.getElementById('sezione-recensioni');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (btnElement) {
        btnElement.classList.add('active');
    }

    if (sezioneItinerari) sezioneItinerari.classList.add('hidden');
    if (sezionePrenotazioni) sezionePrenotazioni.classList.add('hidden');
    if (sezioneImpostazioni) sezioneImpostazioni.classList.add('hidden');
    if (sezioneRecensioni) sezioneRecensioni.classList.add('hidden');

    if (sezioneId === 'sezione-itinerari') {
        if (sezioneItinerari) sezioneItinerari.classList.remove('hidden');
        if (typeof caricaElencoItinerari === 'function') caricaElencoItinerari();
    } else if (sezioneId === 'sezione-prenotazioni') {
        if (sezionePrenotazioni) sezionePrenotazioni.classList.remove('hidden');
        if (typeof caricaPrenotazioniAdmin === 'function') caricaPrenotazioniAdmin();
    } else if (sezioneId === 'sezione-impostazioni') {
        if (sezioneImpostazioni) sezioneImpostazioni.classList.remove('hidden');
    } else if (sezioneId === 'sezione-recensioni') {
        if (sezioneRecensioni) sezioneRecensioni.classList.remove('hidden');
        if (typeof caricaRecensioniAdmin === 'function') caricaRecensioniAdmin();
    }
}
