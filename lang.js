// ================== تغيير اللغة ==================
function setLanguage(lang){

    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = (el.getAttribute('data-lang') === lang) ? 'inline' : 'none';
    });

    // حفظ اللغة المختارة (اختياري لكنه مهم)
    localStorage.setItem('lang', lang);
}

// ================== تشغيل تلقائي عند فتح الصفحة ==================
document.addEventListener('DOMContentLoaded', () => {

    // استرجاع اللغة المحفوظة أو العربية افتراضياً
    let savedLang = localStorage.getItem('lang') || 'ar';

    setLanguage(savedLang);
});
