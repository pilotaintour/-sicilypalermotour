/**
 * Logica Principale di Inizializzazione e Contatti - Sicily Palermo Tour
 */

document.addEventListener('DOMContentLoaded', () => {
    // Carica gli itinerari all'avvio
    if (typeof caricaItinerari === 'function') {
        caricaItinerari();
    }

    // Sincronizzazione automatica quando l'admin aggiorna i dati in un'altra scheda
    window.addEventListener('storage', (e) => {
        if (e.key === 'spt_itineraries' && typeof caricaItinerari === 'function') {
            caricaItinerari(typeof categoriaSelezionata !== 'undefined' ? categoriaSelezionata : 'Tutti');
        }
    });
});

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
