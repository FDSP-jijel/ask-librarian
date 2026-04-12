// ================== تغيير اللغة ==================
function setLanguage(lang){

    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = (el.getAttribute('data-lang') === lang) ? '' : 'none';
    });

    // حفظ اللغة في المتصفح
    localStorage.setItem('lang', lang);
}

// ================== تشغيل تلقائي عند فتح الصفحة ==================
document.addEventListener('DOMContentLoaded', () => {

    let savedLang = localStorage.getItem('lang') || 'ar';
    setLanguage(savedLang);

});
