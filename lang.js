// ================== اللغة الاحترافية ==================

function setLanguage(lang){

    // حفظ اللغة
    localStorage.setItem('lang', lang);

    // 🔹 تغيير النصوص
    document.querySelectorAll('[data-lang]').forEach(el => {

        if(el.getAttribute('data-lang') === lang){
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }

    });

    // 🔹 تغيير placeholder
    document.querySelectorAll('[data-lang-placeholder-ar]').forEach(el => {
        let text = el.getAttribute("data-lang-placeholder-" + lang);
        if(text){
            el.placeholder = text;
        }
    });

    // 🔹 تغيير اتجاه الصفحة
    if(lang === "ar"){
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = lang;
    }

}

// ================== تشغيل تلقائي ==================
document.addEventListener('DOMContentLoaded', () => {

    let savedLang = localStorage.getItem('lang') || 'ar';

    setLanguage(savedLang);

});
