/**
 * MODULO AUTONOMO TRADUTTORE MULTILINGUA GOOGLE
 * Sicily Palermo Tour - Selettore Lingua per Turisti
 */

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'it',
        includedLanguages: 'it,en,fr,de,es,nl,pl,ru,ja,zh-CN,ar',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// Carica lo script di Google Translate in modo asincrono
(function loadGoogleTranslateScript() {
    if (document.getElementById('google-translate-script')) return;

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
})();
