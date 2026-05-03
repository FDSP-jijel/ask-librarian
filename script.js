/* =========================
   GLOBAL VARIABLES
========================= */
let catalog = [];
let currentResults = []; // 👈 هنا
let displayIndex = 0;    // 👈 هنا
let lastQuery = "";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

   localStorage.removeItem("chat");

   let lang = localStorage.getItem("lang") || "ar";
   setLanguage(lang);

   loadChat();
   displayNews();
   updateVisitors();
   loadMessages();
   loadCatalog();

   let searchInput = document.getElementById("searchBook");

   if(searchInput){
       searchInput.addEventListener("keypress", function(e){
           if(e.key === "Enter"){
               searchBooks();
           }
       });
   }

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

    document.querySelectorAll(".page").forEach(p=>{
        p.classList.add("hidden");
    });

    document.querySelectorAll(".navbar button").forEach(b=>{
        b.classList.remove("active");
    });

    let page = document.getElementById(id);
    if(page){
        page.classList.remove("hidden");
    }

    event?.target?.classList.add("active");
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
let query = normalize(q);
lastQuery = query;

if(query.length > 2 && !["مرحبا","hello","bonjour"].includes(query)){
   
    currentResults = catalog.map(row => {

    let full = normalize(row.join(" "));
    let score = 0;

    if(full.startsWith(query)) score += 10;
    else if(full.includes(query)) score += 5;

    query.split(" ").forEach(word => {

    // تطابق كلمة كاملة فقط
    let regex = new RegExp(`\\b${word}\\b`, "i");

    if(regex.test(full)){
        score += 3; // نعطيها وزن أعلى
    } else if(full.includes(word)){
        score += 1;
    }

});

    return { row, score };

})
.filter(r => r.score > 0)
.sort((a,b) => b.score - a.score)
.map(r => r.row);
   
 // 🔥 فلترة إضافية لتحسين الدقة
currentResults = currentResults.filter(row => {
    let text = normalize(row.join(" "));
    
    // 👇 هنا التعديل
    let words = query.split(" ").filter(w => w.length > 1);

    let strongMatch = words.some(word => {

    // إذا الكلمة عربية → includes فقط
    if(/[؀-ۿ]/.test(word)){
        return text.includes(word);
    }

    // إذا لاتينية → regex دقيق
    let regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(text);
});

    return strongMatch;
});

displayIndex = 0;

if(currentResults.length > 0){

// عرض أول دفعة داخل الشات
setTimeout(() => {
    displayChatResults();
}, 300);

        return (lang === "ar") ? "📚 وجدت نتائج:" :
       (lang === "fr") ? "📚 Résultats trouvés:" :
       "📚 Results found:";
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
    // ❌ لا نحفظ شيء
}

function loadChat(){
    // ❌ لا نحمّل أي محادثة قديمة
    document.getElementById("chatbox").innerHTML = "";
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

        let style = n.urgent
            ? "border:2px solid red; background:#fff3f3;"
            : "";

        let badge = n.urgent ? "🚨 عاجل" : "";

        let div = document.createElement("div");

        div.style = style;

        div.innerHTML = `
            <h3>${badge} ${n.title}</h3>
            <p>${n.content}</p>
        `;

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

function highlight(text, query){

    if(!query) return text;

    let words = query.split(" ").filter(w => w.length > 0);
   
    words.forEach(word => {
        let regex = new RegExp(`(${word})`, "gi");
        text = text.replace(regex, `<span style="background:#fde68a; padding:2px 4px; border-radius:4px;">$1</span>`);
    });

    return text;
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

    if(!recognition){
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
}

    let lang = getLang();

    recognition.lang = (lang === "ar") ? "ar-SA" :
                   (lang === "fr") ? "fr-FR" :
                   "en-US";

    recognition.continuous = false;
    recognition.interimResults = false;

   recognition.maxAlternatives = 1;
   
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

async function loadCatalog() {
    try {
        console.log("📂 Loading catalog...");

        let res = await fetch("./catalog_FLPS_jijel.csv");

        if(!res.ok){
            throw new Error("CSV not found");
        }

let saved = localStorage.getItem("customCatalog");
if(saved){
    catalog = JSON.parse(saved);
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

    chunk.forEach((r, i) => {

        let realIndex = displayIndex + i;

        let title = (lang === "ar") ? r[0] :
            (lang === "fr") ? r[1] :
            r[2];

// 🔥 تطبيق التلوين
let query = normalize(lastQuery || "");
title = highlight(title, query);

        html += `
<div onclick="showBookDetails(${realIndex})"
     style="
        cursor:pointer;
        padding:10px;
        margin-bottom:6px;
        border-radius:8px;
        border:1px solid #e5e7eb;
        transition:0.3s;
     "
     onmouseover="this.style.background='#f1f5f9'"
     onmouseout="this.style.background='white'">

     <div style="font-weight:bold;">📚 ${title}</div>

     <div style="font-size:12px; color:#ef4444;">
        📖 <span>
        ${
            lang === "ar" ? "اضغط لرؤية التفاصيل" :
            lang === "fr" ? "Cliquez pour voir les détails" :
            "Click to view details"
        }
        </span>
     </div>

</div>  <!-- 🔥 هذا هو الإغلاق المهم -->
`;
    });

    displayIndex += 5;

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

function showBookDetails(index){

    let lang = getLang();
    let book = currentResults[index];

    if(!book) return;

    let title = (lang === "ar") ? book[0] :
                (lang === "fr") ? book[1] :
                book[2];

    let details = `
        <div>
            <strong>📖 ${title}</strong><br>
            <small>${book.join(" | ")}</small>
        </div>
    `;

    addMessage("bot", details);
}

function toggleAddBook() {
  const box = document.getElementById("addBookBox");
  box.style.display = (box.style.display === "none") ? "block" : "none";
}

function addNewBook() {

  const ar = document.getElementById("newBookAr").value;
  const fr = document.getElementById("newBookFr").value;
  const en = document.getElementById("newBookEn").value;

  const author = document.getElementById("newAuthor").value;
  const publisher = document.getElementById("newPublisher").value;
  const year = document.getElementById("newYear").value;
  const edition = document.getElementById("newEdition").value;
  const call = document.getElementById("newClass").value;
  const copies = document.getElementById("newCopies").value;

  const row = `
    <tr>
      <td>${ar} / ${fr} / ${en}</td>
      <td>${author}</td>
      <td>${publisher}</td>
      <td>${year}</td>
      <td>${edition}</td>
      <td>${call}</td>
      <td>${copies}</td>
    </tr>
  `;

  document.getElementById("booksTableBody").innerHTML += row;
}

function toggleUrgent(){
    let box = document.getElementById("urgentBox");
    box.style.display = (box.style.display === "none") ? "block" : "none";
}

function addUrgentNews(){

    let title = document.getElementById("urgentTitle").value.trim();
    let content = document.getElementById("urgentContent").value.trim();

    if(!title || !content){
        alert("املأ كل الحقول");
        return;
    }

    let item = {
        title,
        content,
        urgent: true,
        time: new Date().toLocaleString()
    };

    news.push(item);
    localStorage.setItem("news", JSON.stringify(news));

    displayNews();

    document.getElementById("urgentTitle").value = "";
    document.getElementById("urgentContent").value = "";
}

function copyEmail(){
    navigator.clipboard.writeText("fdsprbib@gmail.com")
    .then(() => {
        alert("📋 تم نسخ البريد الإلكتروني");
    })
    .catch(() => {
        alert("❌ فشل النسخ");
    });
}

let api = null;

function showMeeting(){

    document.querySelectorAll("section").forEach(s=>{
        s.classList.add("hidden");
    });

    document.getElementById("meeting").classList.remove("hidden");

    const container = document.getElementById("meetContainer");
    container.innerHTML = "";

    if(api){
        api.dispose();
        api = null;
    }

    api = new JitsiMeetExternalAPI("meet.jit.si", {
        roomName: "AskLibrarianRoom_2026_SECURE",
        parentNode: container,
        width: "100%",
        height: 500,

        configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false
        },

        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                "microphone",
                "camera",
                "chat",
                "hangup"
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false
        }
    });

    // ✅ هنا المكان الصحيح
    api.addEventListener('videoConferenceJoined', () => {
   console.log("User joined meeting");
});
}

function shareMeeting(){
    let room = "AskLibrarianRoom_2026_SECURE";

    // إجبار فتح المتصفح
    let link = "https://meet.jit.si/" + room + "#config.startWithVideoMuted=false&config.startWithAudioMuted=false";

    if(navigator.share){
        navigator.share({
            title: "📚 Library Meeting",
            text: "انضم إلى اجتماع المكتبة",
            url: link
        });
    } else {
        navigator.clipboard.writeText(link);

        let lang = getLang();

        alert(
            lang === "ar" ? "📋 تم نسخ رابط الاجتماع" :
            lang === "fr" ? "📋 Lien copié" :
            "📋 Link copied"
        );
    }
}

function openStructure(type){

    let box = document.getElementById("structureDetails");
    let lang = getLang();

    let content = {

        admin: {
            ar: "تشرف الإدارة على تسيير المكتبة وتنظيم العمل.",
            fr: "L'administration gère l'organisation de la bibliothèque.",
            en: "Administration manages the library operations."
        },

        storage: {
            ar: "المخزن يحتوي على الكتب والأرشيف.",
            fr: "Le magasin contient les livres et archives.",
            en: "Storage contains books and archives."
        },

        loan: {
            ar: "بنك الإعارة يسمح باستعارة الكتب.",
            fr: "Service de prêt pour emprunter des livres.",
            en: "Loan service allows borrowing books."
        },

        journals: {
            ar: "قاعة الدوريات تضم المجلات العلمية.",
            fr: "Salle des périodiques pour les revues.",
            en: "Journals room for scientific magazines."
        },

        teachers: {
            ar: "قاعة خاصة بالأساتذة للبحث.",
            fr: "Salle réservée aux enseignants.",
            en: "Room dedicated for teachers."
        },

        reading: {
            ar: "قاعة المطالعة مخصصة للقراءة.",
            fr: "Salle de lecture pour les étudiants.",
            en: "Reading room for students."
        }
    };

    box.style.display = "block";
if(content[type] && content[type][lang]){
    box.innerHTML = content[type][lang];
} else {
    box.innerHTML = "❌ لا توجد معلومات";
}

} // ✅ مهم جداً

function openTab(id){

    document.querySelectorAll(".pub-tab").forEach(t=>{
        t.classList.add("hidden");
    });

    let el = document.getElementById(id);
    if(el) el.classList.remove("hidden");
}

function toggleStructure() {
  const el = document.getElementById("structureContent");
  el.classList.toggle("hidden");
}

function openIqraa(id){
  document.querySelectorAll('.iqraa-content').forEach(el=>{
    el.classList.add('hidden');
  });

  document.getElementById(id).classList.remove('hidden');
}

window.show = show;
window.searchBooks = searchBooks;
window.startVoice = startVoice;
window.toggleDark = toggleDark;
window.reply = reply;
window.setLanguage = setLanguage;
window.showBookDetails = showBookDetails;
window.loadMoreChat = loadMoreChat;
window.addEventListener("DOMContentLoaded", () => {
    openTab("rulesPub");
});
