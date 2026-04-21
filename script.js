/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    let lang = localStorage.getItem("lang") || "ar";
    setLanguage(lang);

   loadChat();
    displayNews();
    updateVisitors();
    loadMessages();

    loadCatalog();
});

function normalize(text){
    return text
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/[^a-z0-9\u0600-\u06FF ]/g, "");
}

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

    // 👇 عند فتح لوحة التحكم
    if(id === "admin"){
        loadMessages();
        updateDashboard();
    }
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

    // 👇 fallback الصحيح
if(q.length > 2){
    return (lang === "ar") ?
        "📚 لم أجد إجابة مباشرة، لكن يمكنك البحث في الفهرس أو كتابة عنوان أوضح." :
        (lang === "fr") ?
        "📚 Je n'ai pas trouvé de réponse directe, essayez de rechercher dans le catalogue." :
        "📚 I didn't find a direct answer, try searching in the catalog.";
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

    let q = document.getElementById("searchBook").value.trim().toLowerCase();
    let box = document.getElementById("bookResults");
    let lang = getLang();

    if(q.length < 2){
    box.innerHTML = "✏️ اكتب كلمة أكثر";
    return;
}
    
    if(!box) return;

    box.innerHTML = "";

    if(!catalog || catalog.length === 0){
        box.innerHTML = "⚠️ الفهرس لم يتم تحميله";
        return;
    }

    let results = catalog.filter(row => {

    let full = normalize((row || []).join(" "));
    let query = normalize(q);

    return full.indexOf(query) !== -1;
});

    if(results.length === 0){
        box.innerHTML =
            lang === "ar" ? "❌ لا توجد نتائج" :
            lang === "fr" ? "❌ Aucun résultat" :
            "❌ No results";
        return;
    }

    results.slice(0, 20).forEach(r => {

        let main = "";
        if(lang === "ar") main = r[0];
        else if(lang === "fr") main = r[1];
        else main = r[2];

        let full = r.join(" | ");

        box.innerHTML += `
            <div>
                <strong>📚 ${main}</strong><br>
                <small>${full}</small>
            </div>
        `;
    });
}

/* =========================
   VOICE (SMART LANG)
========================= */
let recognition; // نخليه global

function startVoice(){

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SpeechRecognition){
        alert("❌ المتصفح لا يدعم الميكروفون (استعمل Chrome)");
        return;
    }

    // إذا كان شغال من قبل نوقفه
    if(recognition){
        recognition.stop();
    }

    recognition = new SpeechRecognition();

    let lang = getLang();

    recognition.lang = (lang === "ar") ? "ar-SA" :
                       (lang === "fr") ? "fr-FR" :
                       "en-US";

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    console.log("🎤 بدأ التسجيل");

    recognition.onstart = function(){
        let btn = document.getElementById("micBtn");
        if(btn) btn.textContent = "🔴";
    };

    recognition.onresult = function(event){
        let text = event.results[0][0].transcript;

        console.log("🎤 تم التعرف:", text);

        document.getElementById("q").value = text;
        reply();
    };

    recognition.onerror = function(event){
        console.error("❌ Mic Error:", event.error);

        if(event.error === "not-allowed"){
            alert("❌ لازم تسمح للميكروفون");
        }
    };

    recognition.onend = function(){
        console.log("🛑 توقف الميكروفون");

        let btn = document.getElementById("micBtn");
        if(btn) btn.textContent = "🎤";
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

    messages.push({
        name,
        email,
        message,
        time: new Date().toLocaleTimeString()
    });

    localStorage.setItem("messages", JSON.stringify(messages));

    alert("تم إرسال الرسالة بنجاح ✅");

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
}

function loadMessages(){

    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let box = document.getElementById("messagesList");

    if(!box) return;

    box.innerHTML = "";

    messages.slice().reverse().forEach((m, index)=>{

        let div = document.createElement("div");
        div.className = "msg-admin";

        div.innerHTML = `
            <div class="msg-avatar">👤</div>

            <div class="msg-content">
                <div class="msg-header">
                    <span class="msg-name">${m.name}</span>
                    <span class="msg-time">${m.time || ""}</span>
                </div>

                <div class="msg-text">${m.message}</div>

                <button class="delete-btn" onclick="deleteMessage(${index})">
                    🗑 حذف
                </button>
            </div>
        `;

        box.appendChild(div);
    });
}

function deleteMessage(i){

    let messages = JSON.parse(localStorage.getItem("messages")) || [];

    messages.splice(i,1);

    localStorage.setItem("messages", JSON.stringify(messages));

    loadMessages();
}

function updateDashboard(){

    // الكتب
    document.getElementById("totalBooks").textContent = books.length;

    // الزوار
    let visitors = localStorage.getItem("visitors") || 0;
    document.getElementById("totalVisitors").textContent = visitors;

    // الرسائل
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    document.getElementById("totalMessages").textContent = messages.length;

    // الإعلانات
    let news = JSON.parse(localStorage.getItem("news")) || [];
    document.getElementById("totalNews").textContent = news.length;
}

let catalog = [];

async function loadCatalog() {
async function loadCatalog() {
    try {
        console.log("📂 Loading catalog...");

        let res = await fetch("./catalog_FLPS_jijel.csv");

        if(!res.ok){
            throw new Error("CSV not found");
        }

        let data = await res.text();

        let rows = data
            .split("\n")
            .map(r => r.trim())
            .filter(r => r.length > 0)
            .map(r => r.split(",").map(c => c.trim()));

        if(rows[0] && rows[0][0].toLowerCase().includes("ar")){
            rows.shift();
        }

        catalog = rows;

        // ✅ هنا مكان الطباعة الصحيح
        console.log("ROW EXAMPLE:", catalog[0]);
        console.log("TOTAL ROWS:", catalog.length);

        console.log("✅ Catalog loaded successfully");

    } catch (e) {
        console.log("❌ Catalog error:", e);
        catalog = [];
    }
}

window.show = show;
window.searchBooks = searchBooks;
window.startVoice = startVoice;
window.toggleDark = toggleDark;
window.reply = reply;
window.setLanguage = setLanguage;
