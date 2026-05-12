/* =========================
   🚀 ADVANCED SCRIPT FEATURES
   =========================== */

/* ===== GLOBAL VARIABLES ===== */
let catalog = [];
let currentResults = [];
let displayIndex = 0;
let lastQuery = "";
let news = JSON.parse(localStorage.getItem("news")) || [];
let recognition;
let api = null;
let urgentActive = false;

/* ===== PERFORMANCE UTILITIES ===== */
const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("chat");
    
    let lang = localStorage.getItem("lang") || "ar";
    setLanguage(lang);
    
    loadChat();
    displayNews();
    updateVisitors();
    loadMessages();
    loadCatalog();
    
    setupEventListeners();
    
    console.log("✅ Application Initialized");
});

/* ===== EVENT LISTENERS ===== */
function setupEventListeners() {
    const searchInput = document.getElementById("searchBook");
    if(searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter") searchBooks();
        });
        
        // Debounce real-time search
        searchInput.addEventListener("input", debounce(searchBooks, 300));
    }
    
    // Smooth scroll for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if(href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if(target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ===== LANGUAGE MANAGEMENT ===== */
function getLang() {
    return localStorage.getItem("lang") || "ar";
}

function setLanguage(lang) {
    localStorage.setItem("lang", lang);
    
    // Update visibility of language-specific elements
    document.querySelectorAll("[data-lang]").forEach(el => {
        el.style.display = (el.getAttribute("data-lang") === lang) ? "" : "none";
    });
    
    // Update document direction
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
    
    // Update active button
    document.querySelectorAll(".language-selector button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    let activeBtn = document.querySelector(`.language-selector button[onclick="setLanguage('${lang}')"]`);
    if(activeBtn) activeBtn.classList.add("active");
    
    // Update all input placeholders
    document.querySelectorAll("input, textarea").forEach(el => {
        let placeholder = el.getAttribute("data-lang-placeholder-" + lang);
        if(placeholder) el.placeholder = placeholder;
    });
}

/* ===== NAVIGATION ===== */
function show(id) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.add("hidden");
    });
    
    document.querySelectorAll(".navbar button").forEach(b => {
        b.classList.remove("active");
    });
    
    let page = document.getElementById(id);
    if(page) {
        page.classList.remove("hidden");
        page.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    if(event?.target) event.target.classList.add("active");
}

/* ===== DARK MODE ===== */
function toggleDark() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

// Load dark mode preference
window.addEventListener('load', () => {
    if(localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark");
    }
});

/* ===== CHAT SYSTEM ===== */
function addMessage(type, text) {
    let box = document.getElementById("chatbox");
    if(!box) return;
    
    let msg = document.createElement("div");
    msg.className = "msg " + type;
    msg.innerHTML = text;
    
    box.appendChild(msg);
    
    // Smooth scroll to latest message
    setTimeout(() => {
        box.scrollTop = box.scrollHeight;
    }, 50);
}

function showTyping() {
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

function removeTyping() {
    let t = document.getElementById("typing");
    if(t) t.remove();
}

/* ===== AI RESPONSE ===== */
function generateReply(q) {
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
            books: "���� Utilisez le catalogue ou visitez la bibliothèque.",
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
    
    let query = normalize(q);
    lastQuery = query;
    
    // Smart catalog search
    if(query.length > 2 && !["مرحبا","hello","bonjour"].includes(query)) {
        currentResults = catalog.map(row => {
            let full = normalize(row.join(" "));
            let score = 0;
            
            if(full.startsWith(query)) score += 10;
            else if(full.includes(query)) score += 5;
            
            query.split(" ").forEach(word => {
                let regex = new RegExp(`\\b${word}\\b`, "i");
                if(regex.test(full)) score += 3;
                else if(full.includes(word)) score += 1;
            });
            
            return { row, score };
        })
        .filter(r => r.score > 0)
        .sort((a,b) => b.score - a.score)
        .map(r => r.row);
        
        displayIndex = 0;
        
        if(currentResults.length > 0) {
            setTimeout(() => displayChatResults(), 300);
            return (lang === "ar") ? "📚 وجدت نتائج:" :
                   (lang === "fr") ? "📚 Résultats trouvés:" :
                   "📚 Results found:";
        }
    }
    
    // Intent matching
    for(let intent of intents) {
        if(intent.patterns.some(p => q.includes(p))) {
            return r[intent.key];
        }
    }
    
    return r.default;
}

/* ===== CHAT REPLY ===== */
function reply() {
    let input = document.getElementById("q");
    let q = input.value.trim();
    
    if(!q) return;
    
    addMessage("user", q);
    input.value = "";
    
    showTyping();
    
    setTimeout(() => {
        removeTyping();
        let r = generateReply(q.toLowerCase());
        addMessage("bot", r);
    }, 700);
}

/* ===== TEXT UTILITIES ===== */
function normalize(text) {
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

function highlight(text, query) {
    if(!query) return text;
    
    let words = query.split(" ").filter(w => w.length > 0);
    
    words.forEach(word => {
        let regex = new RegExp(`(${word})`, "gi");
        text = text.replace(regex, `<span style="background:#fde68a; padding:2px 4px; border-radius:4px;">$1</span>`);
    });
    
    return text;
}

/* ===== BOOK SEARCH ===== */
function searchBooks() {
    let q = document.getElementById("searchBook").value.trim().toLowerCase();
    let box = document.getElementById("bookResults");
    let lang = getLang();
    
    if(!box) return;
    
    if(q.length < 2) {
        box.innerHTML = lang === "ar" ? "✏️ اكتب كلمة أكثر" :
                       lang === "fr" ? "✏️ Écrivez plus de lettres" :
                       "✏️ Type more characters";
        return;
    }
    
    if(!catalog || catalog.length === 0) {
        box.innerHTML = "⚠️ الفهرس لم يتم تحميله";
        return;
    }
    
    let query = normalize(q);
    
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
    .filter(r => r.score > 0)
    .sort((a,b) => b.score - a.score)
    .map(r => r.row);
    
    displayIndex = 0;
    box.innerHTML = "";
    
    if(currentResults.length === 0) {
        box.innerHTML = lang === "ar" ? "❌ لا توجد نتائج" :
                       lang === "fr" ? "❌ Aucun résultat" :
                       "❌ No results";
        return;
    }
    
    displayMore();
}

function displayMore() {
    let box = document.getElementById("bookResults");
    let lang = getLang();
    
    let oldBtn = document.querySelector("#bookResults button");
    if(oldBtn) oldBtn.remove();
    
    let next = currentResults.slice(displayIndex, displayIndex + 50);
    
    next.forEach(r => {
        let main = lang === "ar" ? r[0] : (lang === "fr" ? r[1] : r[2]);
        let full = r.join(" | ");
        
        box.innerHTML += `
            <div style="margin-bottom:10px; padding:10px; border-radius:8px; background:rgba(0,0,0,0.05); cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#f0f7ff'" onmouseout="this.style.background='rgba(0,0,0,0.05)'">
                <strong>📚 ${main}</strong><br>
                <small>${full}</small>
            </div>
        `;
    });
    
    displayIndex += 50;
    
    if(displayIndex < currentResults.length) {
        box.innerHTML += `<button onclick="displayMore()" style="padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer;">⬇️ عرض المزيد</button>`;
    }
}

function displayChatResults() {
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
        let title = (lang === "ar") ? r[0] : (lang === "fr") ? r[1] : r[2];
        
        let query = normalize(lastQuery || "");
        title = highlight(title, query);
        
        html += `
            <div onclick="showBookDetails(${realIndex})" style="cursor:pointer; padding:10px; margin-bottom:6px; border-radius:8px; border:1px solid #e5e7eb; transition:0.3s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                <div style="font-weight:bold;">📚 ${title}</div>
                <div style="font-size:12px; color:#ef4444;">
                    📖 ${lang === "ar" ? "اضغط لرؤية التفاصيل" : lang === "fr" ? "Cliquez pour voir les détails" : "Click to view details"}
                </div>
            </div>
        `;
    });
    
    displayIndex += 5;
    
    if(displayIndex < currentResults.length) {
        html += `<br><button onclick="loadMoreChat()" style="padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer;">⬇️ ${
            lang === "ar" ? "عرض المزيد" :
            lang === "fr" ? "Afficher plus" :
            "Load more"
        }</button>`;
    }
    
    html += `</div>`;
    addMessage("bot", html);
}

function loadMoreChat() {
    displayChatResults();
}

function showBookDetails(index) {
    let lang = getLang();
    let book = currentResults[index];
    
    if(!book) return;
    
    let title = (lang === "ar") ? book[0] : (lang === "fr") ? book[1] : book[2];
    
    let details = `
        <div>
            <strong>📖 ${title}</strong><br>
            <small>${book.join(" | ")}</small>
        </div>
    `;
    
    addMessage("bot", details);
}

/* ===== VOICE RECOGNITION ===== */
function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if(!SpeechRecognition) {
        alert("❌ المتصفح لا يدعم الميكروفون (استعمل Chrome)");
        return;
    }
    
    if(recognition) recognition.stop();
    
    if(!recognition) {
        recognition = new SpeechRecognition();
    }
    
    let lang = getLang();
    recognition.lang = (lang === "ar") ? "ar-SA" :
                      (lang === "fr") ? "fr-FR" : "en-US";
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    
    recognition.onstart = () => {
        let btn = document.getElementById("micBtn");
        if(btn) btn.textContent = "🔴";
    };
    
    recognition.onresult = (event) => {
        let text = event.results[0][0].transcript;
        document.getElementById("q").value = text;
        reply();
    };
    
    recognition.onerror = (event) => {
        if(event.error === "not-allowed") {
            alert("❌ لازم تسمح للميكروفون");
        }
    };
    
    recognition.onend = () => {
        let btn = document.getElementById("micBtn");
        if(btn) btn.textContent = "🎤";
    };
}

/* ===== NEWS SYSTEM ===== */
function addNews() {
    let title = document.getElementById("newsTitle")?.value.trim();
    let content = document.getElementById("newsContent")?.value.trim();
    
    if(!title || !content) return;
    
    news.push({ title, content, time: new Date().toLocaleString() });
    localStorage.setItem("news", JSON.stringify(news));
    
    displayNews();
    
    document.getElementById("newsTitle").value = "";
    document.getElementById("newsContent").value = "";
}

function displayNews() {
    let box = document.getElementById("newsList");
    if(!box) return;
    
    box.innerHTML = "";
    
    news.slice().reverse().forEach(n => {
        let style = n.urgent ? "border:2px solid red; background:#fff3f3;" : "";
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

/* ===== STATISTICS ===== */
function updateVisitors() {
    let visitors = parseInt(localStorage.getItem("visitors")) || 0;
    visitors++;
    localStorage.setItem("visitors", visitors);
    
    let el = document.getElementById("visitors");
    if(el) el.textContent = visitors;
}

/* ===== CATALOG LOADING ===== */
async function loadCatalog() {
    try {
        let res = await fetch("./catalog_FLPS_jijel.csv");
        
        if(!res.ok) throw new Error("CSV not found");
        
        let data = await res.text();
        
        let rows = data
            .split("\n")
            .map(r => r.trim())
            .filter(r => r.length > 0)
            .map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim()));
        
        if(rows[0] && rows[0][0].toLowerCase().includes("ar")) {
            rows.shift();
        }
        
        catalog = rows;
        
        console.log("✅ Catalog loaded:", catalog.length, "items");
    } catch (e) {
        console.log("❌ Catalog error:", e);
    }
}

/* ===== CHAT PERSISTENCE ===== */
function saveChat() {
    // حالياً نترك الشات بدون حفظ تلقائي
}

function loadChat() {
    let box = document.getElementById("chatbox");
    if(box) box.innerHTML = "";
}

/* ===== MEETINGS ===== */
function showMeeting() {
    document.querySelectorAll(".page").forEach(s => {
        s.classList.add("hidden");
    });
    
    let meeting = document.getElementById("meeting");
    if(meeting) meeting.classList.remove("hidden");
}

function openMeet() {
    document.getElementById("meetingStatus").innerText = "🚀 يتم فتح الاجتماع...";
    window.open("https://meet.google.com/nbx-eakb-tor", "_blank");
}

/* ===== EXPORT GLOBAL FUNCTIONS ===== */
window.show = show;
window.searchBooks = searchBooks;
window.startVoice = startVoice;
window.toggleDark = toggleDark;
window.reply = reply;
window.setLanguage = setLanguage;
window.showBookDetails = showBookDetails;
window.loadMoreChat = loadMoreChat;
window.displayMore = displayMore;
window.addNews = addNews;
window.showMeeting = showMeeting;
window.openMeet = openMeet;

console.log("🚀 Script loaded successfully");
