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
function reply(){
    let input = document.getElementById("q");
    let q = input.value.trim().toLowerCase();
    let box = document.getElementById("chatbox");

    if(!q) return;

    box.innerHTML += `<p>👤 ${q}</p>`;

    let r = "❓ لم أفهم سؤالك، حاول مرة أخرى";

    // ===== مرادفات =====
    if(q.includes("ساعات") || q.includes("وقت") || q.includes("متى") || q.includes("فتح")){
        r = "🕒 المكتبة مفتوحة من 8:30 صباحاً إلى 16:30 مساءً.";
    }

    else if(q.includes("كتاب") || q.includes("بحث") || q.includes("مراجع") || q.includes("مصادر")){
        r = "📚 يمكنك البحث في الفهرس الإلكتروني أو زيارة المكتبة مباشرة للحصول على المراجع.";
    }

    else if(q.includes("إعارة") || q.includes("استعارة") || q.includes("كتب")){
        r = "📖 يمكن استعارة 4 كتب لمدة أسبوع واحد مع إمكانية التجديد.";
    }

    else if(q.includes("موقع") || q.includes("أين") || q.includes("مكان")){
        r = "📍 تقع المكتبة في الطابق الأول والثاني داخل كلية الحقوق والعلوم السياسية.";
    }

    else if(q.includes("فهرس") || q.includes("بحث إلكتروني")){
        r = "🌐 يمكنك استخدام الفهرس الإلكتروني: bc.univ-jijel.dz/opac-dsp";
    }

    else if(q.includes("مرحبا") || q.includes("السلام")){
        r = "👋 مرحباً بك! أنا مساعد المكتبة، كيف أساعدك؟";
    }

    else if(q.includes("شكرا") || q.includes("شكرا لك")){
        r = "😊 العفو! سعيد بمساعدتك.";
    }

    box.innerHTML += `<p>🤖 ${r}</p>`;
    box.scrollTop = box.scrollHeight;

    input.value = "";
}
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

let visitors = localStorage.getItem("visitors") || 0;
visitors++;
localStorage.setItem("visitors", visitors);

document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("visitors").textContent = visitors;
});

let books = [
    "القانون المدني",
    "القانون الدستوري",
    "مدخل للعلوم السياسية",
    "الاقتصاد الجزائري",
    "حقوق الإنسان",
    "علم الاجتماع"
];

function searchBooks(){
    let q = document.getElementById("searchBook").value.toLowerCase();
    let box = document.getElementById("bookResults");

    box.innerHTML = "";

    let results = books.filter(b => b.toLowerCase().includes(q));

    if(results.length === 0){
        box.innerHTML = "لا توجد نتائج";
        return;
    }

    results.forEach(b=>{
        box.innerHTML += `<p>📚 ${b}</p>`;
    });
}
