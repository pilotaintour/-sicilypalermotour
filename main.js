/**
 * Logica di interazione per Sicily Palermo Tour
 */

function mostraDettagli(nomeTour) {
    alert("Grazie per l'interesse! Il tour '" + nomeTour + "' sarà presto prenotabile sul sito.");
}

function inviaMessaggio(event) {
    event.preventDefault(); // Impedisce il ricaricamento della pagina

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const messaggio = document.getElementById('messaggio').value;

    if (nome && email && messaggio) {
        alert("Grazie " + nome + "! Il tuo messaggio è stato inviato con successo. Ti risponderemo presto all'indirizzo " + email + ".");
        // Ripulisce il form
        document.getElementById('contactForm').reset();
    } else {
        alert("Per favore, compila tutti i campi obbligatori.");
    }
}
