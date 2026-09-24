/**
 * MODULO AUTONOMO TRADUTTORE MULTILINGUA GOOGLE
 * Sicily Palermo Tour - Selettore Lingua con Supporto per Contenuti Dinamici
 */

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'it',
        includedLanguages: 'it,en,fr,de,es,nl,pl,ru,ja,zh-CN,ar',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// Notifica Google Translate quando gli itinerari o le tappe vengono inserite dinamicamente nel DOM
function aggiornaTraduzioneDinamica() {
    setTimeout(() => {
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl && selectEl.value && selectEl.value !== 'it') {
            const event = new Event('change', { bubbles: true });
            selectEl.dispatchEvent(event);
        }
    }, 120);
}

// Carica lo script di Google Translate in modo asincrono
(function loadGoogleTranslateScript() {
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
})();
