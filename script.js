/* =========================
   GLOBAL VARIABLES
========================= */
let catalog = [];
let currentResults = []; // 👈 هنا
let displayIndex = 0;    // 👈 هنا

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

    // 👇 ضع الكود هنا بالضبط
    document.getElementById("searchBook").addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            searchBooks();
        }
    });
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
    msg.innerHTML = text;

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

 // 🔍 ربط ذكي مع الفهرس
if(q.includes("كتاب") || q.includes("book") || q.includes("livre")){

    let query = normalize(q);

    let results = catalog.filter(row =>
        normalize(row.join(" ")).includes(query)
    );

    if(results.length > 0){

        // نخزن النتائج في البحث الرئيسي
        currentResults = results;
        displayIndex = 0;

        // نخزن النتائج
currentResults = results;
displayIndex = 0;

// عرض أول دفعة داخل الشات
setTimeout(() => {
    displayChatResults();
}, 300);

        let reply = (lang === "ar") ? "📚 وجدت بعض الكتب، يتم عرضها الآن..." :
                    (lang === "fr") ? "📚 Résultats trouvés..." :
                    "📚 Results found...";

        return reply + "\n\n📖 تم عرض النتائج في الصفحة الرئيسية";
    }
}

    // ✅ 2. intents بعده
    for(let intent of intents){
        if(intent.patterns.some(p => q.includes(p))){
            return r[intent.key];
        }
    }

    // ❌ 3. fallback في الأخير فقط
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

function normalize(text){
    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u064B-\u065F]/g, "")
        .replace(/[إأآا]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ")
        .trim();
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

    if(!box) return;

    if(q.length < 2){
        box.innerHTML =
    lang === "ar" ? "✏️ اكتب كلمة أكثر" :
    lang === "fr" ? "✏️ Écrivez plus de lettres" :
    "✏️ Type more characters";
        return;
    }

    if(!catalog || catalog.length === 0){
        box.innerHTML = "⚠️ الفهرس لم يتم تحميله";
        return;
    }

    let query = normalize(q);

    // 🔥 بناء النتائج مع score
    currentResults = catalog.map(row => {

        let full = normalize(row.join(" "));
        let score = 0;

        if(full.startsWith(query)) score += 10;
else if(full.includes(query)) score += 5;
       
        query.split(" ").forEach(word => {
            if(full.includes(word)) score += 1;
        });

        return { row, score };

    })
    .filter(r => r.score > 0) // فقط النتائج المطابقة
    .sort((a,b) => b.score - a.score) // ترتيب ذكي
    .map(r => r.row); // ❗ مهم جداً (نرجع فقط row)

    // 🔁 إعادة البداية
    displayIndex = 0;
    box.innerHTML = "";

    // ❌ لا توجد نتائج
    if(currentResults.length === 0){
        box.innerHTML =
            lang === "ar" ? "❌ لا توجد نتائج" :
            lang === "fr" ? "❌ Aucun résultat" :
            "❌ No results";
        return;
    }

    // ✅ عرض أول دفعة
    displayMore();
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

function setLanguage(lang){

    // حفظ اللغة
    localStorage.setItem("lang", lang);

    // إظهار النصوص حسب اللغة
    document.querySelectorAll("[data-lang]").forEach(el=>{
        el.style.display = (el.getAttribute("data-lang") === lang) ? "" : "none";
    });

    // اتجاه الصفحة
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    // تفعيل زر اللغة المختارة (اختياري)
    document.querySelectorAll(".language-selector button").forEach(btn=>{
        btn.classList.remove("active");
    });

    let activeBtn = document.querySelector(`.language-selector button[onclick="setLanguage('${lang}')"]`);
    if(activeBtn) activeBtn.classList.add("active");

    // ✅ تحديث placeholder لكل input و textarea
    document.querySelectorAll("input, textarea").forEach(el => {

        let placeholder = el.getAttribute("data-lang-placeholder-" + lang);

        if(placeholder){
            el.placeholder = placeholder;
        }
    });
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
            .map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim()));
        if(rows[0] && rows[0][0].toLowerCase().includes("ar")){
            rows.shift();
        }

        catalog = rows;

        console.log("ROW EXAMPLE:", catalog[0]);
        console.log("TOTAL ROWS:", catalog.length);

        console.log("✅ Catalog loaded successfully");

    } catch (e) {
        console.log("❌ Catalog error:", e);
    }
}

function displayMore(){

    let box = document.getElementById("bookResults");
    let lang = getLang();

    // حذف زر قديم
    let oldBtn = document.querySelector("#bookResults button");
    if(oldBtn) oldBtn.remove();

    let next = currentResults.slice(displayIndex, displayIndex + 50);

    next.forEach(r => {

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

    displayIndex += 50;

    if(displayIndex < currentResults.length){
        box.innerHTML += `
            <button onclick="displayMore()">⬇️ عرض المزيد</button>
        `;
    }
}

function displayChatResults(){

    let lang = getLang();
    let chunk = currentResults.slice(displayIndex, displayIndex + 5);

    if(chunk.length === 0) return;

    let html = `<div>📚 <strong>${
        lang === "ar" ? "نتائج البحث:" :
        lang === "fr" ? "Résultats:" :
        "Results:"
    }</strong><br>`;

    chunk.forEach(r => {

        let title = (lang === "ar") ? r[0] :
                    (lang === "fr") ? r[1] :
                    r[2];

        html += `• ${title}<br>`;
    });

    displayIndex += 5;

    // زر عرض المزيد
    if(displayIndex < currentResults.length){
        html += `<br><button onclick="loadMoreChat()">⬇️ ${
            lang === "ar" ? "عرض المزيد" :
            lang === "fr" ? "Afficher plus" :
            "Load more"
        }</button>`;
    }

    html += `</div>`;

    addMessage("bot", html);
}

function loadMoreChat(){
    displayChatResults();
}

window.show = show;
window.searchBooks = searchBooks;
window.startVoice = startVoice;
window.toggleDark = toggleDark;
window.reply = reply;
window.setLanguage = setLanguage;
