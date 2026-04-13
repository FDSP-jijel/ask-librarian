// ================== اللغة (نسخة آمنة) ==================

function setLanguage(lang){

    // نحفظ اللغة
    localStorage.setItem('lang', lang);

    // نغيّر فقط العناصر التي لديها data-lang فعليًا
    document.querySelectorAll('[data-lang]').forEach(el => {

        if(el.getAttribute('data-lang') === lang){
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
}

// ================== تشغيل تلقائي ==================
document.addEventListener('DOMContentLoaded', () => {

    let savedLang = localStorage.getItem('lang') || 'ar';

    // تأخير بسيط لضمان تحميل DOM
    setTimeout(() => {
        setLanguage(savedLang);
    }, 100);
});
