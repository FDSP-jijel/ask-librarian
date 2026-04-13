/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    setLanguage("ar");
    loadChat();
    displayNews();
    updateVisitors();
});

/* =========================
   NAVIGATION
========================= */
function show(id){
    document.querySelectorAll("section").forEach(s=>{
        s.classList.add("hidden");
    });

    let page = document.getElementById(id);
    if(page) page.classList.remove("hidden");
}

/* =========================
   DARK MODE
========================= */
function toggleDark(){
    document.body.classList.toggle("dark");
}

/* =========================
   CHAT SYSTEM
========================= */
function addMessage(type, text){
    let box = document.getElementById("chatbox");

    let msg = document.createElement("div");
    msg.className = "msg " + type;
    msg.textContent = text;

    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;

    saveChat();
}

function showTyping(){
    let box = document.getElementById("chatbox");

    let typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.id = "typing";
    typing.textContent = "يكتب الآن...";

    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;
}

function removeTyping(){
    let t = document.getElementById("typing");
    if(t) t.remove();
}

/* =========================
   AI RESPONSE (FREE LOGIC)
========================= */
function generateReply(q){

    if(q.includes("وقت") || q.includes("ساعات") || q.includes("متى") || q.includes("فتح")){
        return "🕒 المكتبة مفتوحة من 8:30 صباحاً إلى 16:30 مساءً.";
    }

    if(q.includes("كتاب") || q.includes("بحث") || q.includes("مراجع")){
        return "📚 يمكنك استخدام الفهرس أو زيارة المكتبة للحصول على الكتب.";
    }

    if(q.includes("إعارة") || q.includes("استعارة")){
        return "📖 يمكن استعارة 4 كتب لمدة أسبوع مع إمكانية التجديد.";
    }

    if(q.includes("أين") || q.includes("موقع") || q.includes("مكان")){
        return "📍 تقع المكتبة داخل كلية الحقوق والعلوم السياسية.";
    }

    if(q.includes("مرحبا") || q.includes("السلام")){
        return "👋 مرحباً بك! أنا مساعد المكتبة، كيف أساعدك؟";
    }

    if(q.includes("شكرا")){
        return "😊 العفو! سعيد بمساعدتك.";
    }

    return "❓ لم أفهم سؤالك، حاول بصيغة أخرى.";
}

/* =========================
   MAIN CHAT FUNCTION
========================= */
function reply(){
    let input = document.getElementById("q");
    let q = input.value.trim();

    if(!q) return;

    addMessage("user", q);
    input.value = "";

    showTyping();

    setTimeout(()=>{
        removeTyping();
        let r = generateReply(q.toLowerCase());
        addMessage("bot", r);
    }, 800);
}

/* =========================
   CHAT SAVE / LOAD
========================= */
function saveChat(){
    localStorage.setItem("chat", document.getElementById("chatbox").innerHTML);
}

function loadChat(){
    let saved = localStorage.getItem("chat");
    if(saved){
        document.getElementById("chatbox").innerHTML = saved;
    }
}

/* =========================
   NEWS SYSTEM
========================= */
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
    if(!box) return;

    box.innerHTML = "";

    news.slice().reverse().forEach(n=>{
        let div = document.createElement("div");
        div.innerHTML = `<h3>${n.title}</h3><p>${n.content}</p>`;
        box.appendChild(div);
    });
}

/* =========================
   VISITORS
========================= */
function updateVisitors(){
    let visitors = localStorage.getItem("visitors") || 0;
    visitors++;
    localStorage.setItem("visitors", visitors);

    let el = document.getElementById("visitors");
    if(el) el.textContent = visitors;
}

/* =========================
   BOOK SEARCH
========================= */
let books = [
    "القانون المدني",
    "القانون الدستوري",
    "مدخل للعلوم السياسية",
    "حقوق الإنسان",
    "الاقتصاد الجزائري",
    "علم الاجتماع"
];

function searchBooks(){
    let q = document.getElementById("searchBook").value.toLowerCase();
    let box = document.getElementById("bookResults");

    if(!box) return;

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

function startVoice(){

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SpeechRecognition){
        alert("المتصفح لا يدعم الميكروفون");
        return;
    }

    let recognition = new SpeechRecognition();

    recognition.lang = "ar-SA"; // العربية
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event){
        let text = event.results[0][0].transcript;

        document.getElementById("q").value = text;

        // تشغيل الرد مباشرة
        reply();
    };

    recognition.onerror = function(){
        alert("حدث خطأ في الميكروفون");
    };
}
