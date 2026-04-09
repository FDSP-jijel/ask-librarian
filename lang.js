function setLanguage(lang){
    document.querySelectorAll('[data-lang]').forEach(el=>{
        el.style.display = (el.getAttribute('data-lang') === lang) ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    setLanguage('ar'); // اللغة الافتراضية العربية
});

function show(sectionId){
    document.querySelectorAll('section').forEach(sec=>{
        sec.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// مثال لمساعد افتراضي
function reply(){
    let q = document.getElementById('q').value;
    let box = document.getElementById('chatbox');
    let p = document.createElement('p');
    p.textContent = "المساعد: لم يتم برمجة الردود بعد على السؤال: " + q;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
    document.getElementById('q').value = "";
}