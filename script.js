/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    let lang = localStorage.getItem("lang") || "ar";
    setLanguage(lang);
    loadChat();
    displayNews();
    updateVisitors();
});

/* =========================
   GET CURRENT LANGUAGE
========================= */
function getLang(){
    return localStorage.getItem("lang") || "ar";
}

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
    let lang = getLang();

    let text = {
        ar: "يكتب الآن...",
        fr: "En train d'écrire...",
        en: "Typing..."
    };

    let typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.id = "typing";
    typing.textContent = text[lang];

    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;
}

function removeTyping(){
    let t = document.getElementById("typing");
    if(t) t.remove();
}

/* =========================
   AI RESPONSE (MULTI LANG)
========================= */
function generateReply(q){

    let lang = getLang();
    q = q.toLowerCase();

    const responses = {
        ar: {
            hours: "🕒 المكتبة مفتوحة من 8:30 إلى 16:30.",
            books: "📚 يمكنك البحث في الفهرس أو زيارة المكتبة.",
            borrow: "📖 يمكنك استعارة 4 كتب لمدة أسبوع.",
            place: "📍 المكتبة داخل الكلية.",
            hello: "👋 مرحباً بك! كيف أساعدك؟",
            thanks: "😊 على الرحب والسعة!",
            default: "❓ لم أفهم سؤالك، حاول بشكل أوضح."
        },
        fr: {
            hours: "🕒 La bibliothèque est ouverte de 8h30 à 16h30.",
            books: "📚 Utilisez le catalogue ou visitez la bibliothèque.",
            borrow: "📖 Vous pouvez emprunter 4 livres pour une semaine.",
            place: "📍 La bibliothèque est dans la faculté.",
            hello: "👋 Bonjour ! Comment puis-je aider ?",
            thanks: "😊 Avec plaisir !",
            default: "❓ Je n'ai pas compris."
        },
        en: {
            hours: "🕒 Library open from 8:30 to 16:30.",
            books: "📚 Use the catalog or visit the library.",
            borrow: "📖 You can borrow 4 books for one week.",
            place: "📍 Library is inside the faculty.",
            hello: "👋 Hello! How can I help?",
            thanks: "😊 You're welcome!",
            default: "❓ I didn't understand clearly."
        }
    };

    let r = responses[lang];

    /* ================= AI INTENT ENGINE ================= */

    const intents = [
        { key: "hours", patterns: ["وقت", "ساعات", "متى", "open", "opening", "heure", "horaire"] },
        { key: "books", patterns: ["كتاب", "بحث", "livre", "book", "search", "recherche"] },
        { key: "borrow", patterns: ["إعارة", "استعارة", "borrow", "emprunt", "loan"] },
        { key: "place", patterns: ["أين", "موقع", "where", "place", "où"] },
        { key: "hello", patterns: ["مرحبا", "bonjour", "hello", "hi"] },
        { key: "thanks", patterns: ["شكرا", "merci", "thanks"] }
    ];

    for(let intent of intents){
        if(intent.patterns.some(p => q.includes(p))){
            return r[intent.key];
        }
    }

    return r.default;
}
  
/* =========================
   MAIN CHAT
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
    }, 700);
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
   BOOK SEARCH (MULTI LANG)
========================= */
let books = [
    {ar:"القانون المدني", fr:"Droit civil", en:"Civil Law"},
    {ar:"القانون الدستوري", fr:"Droit constitutionnel", en:"Constitutional Law"},
    {ar:"علوم سياسية", fr:"Sciences politiques", en:"Political Science"},
    {ar:"حقوق الإنسان", fr:"Droits de l'homme", en:"Human Rights"}
];

function searchBooks(){
    let q = document.getElementById("searchBook").value.toLowerCase();
    let box = document.getElementById("bookResults");
    let lang = getLang();

    if(!box) return;

    box.innerHTML = "";

    let results = books.filter(b =>
        b.ar.toLowerCase().includes(q) ||
        b.fr.toLowerCase().includes(q) ||
        b.en.toLowerCase().includes(q)
    );

    if(results.length === 0){
        box.innerHTML = (lang==="ar") ? "لا توجد نتائج" :
                        (lang==="fr") ? "Aucun résultat" :
                        "No results";
        return;
    }

    results.forEach(b=>{
        box.innerHTML += `<p>📚 ${b[lang]}</p>`;
    });
}

/* =========================
   VOICE (SMART LANG)
========================= */
function startVoice(){

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SpeechRecognition){
        alert("المتصفح لا يدعم الميكروفون");
        return;
    }

    let recognition = new SpeechRecognition();

    // يدعم 3 لغات حسب اختيار المستخدم
    let lang = getLang();

    if(lang === "ar") recognition.lang = "ar-SA";
    if(lang === "fr") recognition.lang = "fr-FR";
    if(lang === "en") recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = function(event){
        let text = event.results[0][0].transcript;

        document.getElementById("q").value = text;
        reply();
    };
}
// فتح/غلق القائمة
function toggleLangMenu(){
    let menu = document.getElementById("langMenu");

    if(menu.style.display === "flex"){
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
}

// إغلاق تلقائي عند اختيار لغة
function setLanguage(lang){

    localStorage.setItem("lang", lang);

    document.querySelectorAll("[data-lang]").forEach(el=>{
        el.style.display = (el.getAttribute("data-lang") === lang) ? "" : "none";
    });

    // ✔ هنا الصحيح
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    document.querySelectorAll(".language-selector .lang").forEach(btn=>{
        btn.classList.remove("active");
    });

    let activeBtn = document.querySelector(".language-selector ."+lang);
    if(activeBtn) activeBtn.classList.add("active");
}

function sendMessage(){

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let message = document.getElementById("message").value.trim();

    if(!name || !email || !message){
        alert("يرجى ملء جميع الحقول");
        return;
    }

    let messages = JSON.parse(localStorage.getItem("messages")) || [];

    messages.push({name, email, message});

    localStorage.setItem("messages", JSON.stringify(messages));

    alert("تم إرسال الرسالة بنجاح ✅");

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
}
