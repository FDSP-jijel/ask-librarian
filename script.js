// ================= اللغة =================
function setLanguage(lang){
    document.querySelectorAll('[data-lang]').forEach(el=>{
        el.style.display = (el.getAttribute('data-lang') === lang) ? '' : 'none';
    });
}

// تشغيل اللغة الافتراضية
document.addEventListener("DOMContentLoaded", ()=>{
    setLanguage('ar');
    loadChat();
    displayNews();
});


// ================= التنقل =================
function show(id){
    document.querySelectorAll("section").forEach(s=>{
        s.classList.add("hidden");
    });

    document.getElementById(id).classList.remove("hidden");
}


// ================= الإعلانات =================
let news = JSON.parse(localStorage.getItem("news")) || [];

function addNews(){
    let title = document.getElementById("newsTitle").value.trim();
    let content = document.getElementById("newsContent").value.trim();

    if(!title || !content) return;

    news.push({title, content});
    localStorage.setItem("news", JSON.stringify(news));

    displayNews();

    document.getElementById("newsTitle").value = "";
    document.getElementById("newsContent").value = "";
}

function displayNews(){
    let box = document.getElementById("newsList");
    box.innerHTML = "";

    news.slice().reverse().forEach(n=>{
        let div = document.createElement("div");
        div.innerHTML = `<h3>${n.title}</h3><p>${n.content}</p>`;
        box.appendChild(div);
    });
}


// ================= المساعد =================
async function reply(){

    let input = document.getElementById("q");
    let q = input.value.trim();
    let box = document.getElementById("chatbox");

    if(!q) return;

    // عرض المستخدم
    box.innerHTML += `<p>👤 ${q}</p>`;

    // رسالة انتظار
    let loading = document.createElement("p");
    loading.id = "loading";
    loading.textContent = "🤖 جاري التفكير...";
    box.appendChild(loading);

    box.scrollTop = box.scrollHeight;

    await new Promise(r => setTimeout(r, 700));

    loading.remove();

    let response = "❓ لم أفهم سؤالك";

    if(q.includes("ساعات") || q.includes("وقت")){
        response = "🕒 المكتبة مفتوحة من 8:30 إلى 16:30.";
    }
    else if(q.includes("كتاب") || q.includes("بحث")){
        response = "📚 يمكنك البحث عبر الفهرس أو سؤال الموظف.";
    }
    else if(q.includes("إعارة")){
        response = "📖 الإعارة: 4 كتب لمدة أسبوع قابلة للتجديد.";
    }
    else if(q.includes("موقع")){
        response = "📍 الطابق الأول والثاني داخل الكلية.";
    }
    else if(q.includes("فهرس")){
        response = "🌐 bc.univ-jijel.dz/opac-dsp";
    }

    box.innerHTML += `<p>🤖 ${response}</p>`;

    input.value = "";
    box.scrollTop = box.scrollHeight;

    saveChat();
}


// ================= حفظ المحادثة =================
function saveChat(){
    localStorage.setItem("chat", document.getElementById("chatbox").innerHTML);
}

function loadChat(){
    let saved = localStorage.getItem("chat");
    if(saved){
        document.getElementById("chatbox").innerHTML = saved;
    }
}


// ================= الوضع الليلي =================
function toggleDark(){
    document.body.classList.toggle("dark");
}
