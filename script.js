// ================= اللغة =================
function setLanguage(lang){
    document.querySelectorAll('[data-lang]').forEach(el=>{
        el.style.display = (el.getAttribute('data-lang') === lang) ? '' : 'none';
    });
}

// ================= تحميل الصفحة =================
document.addEventListener("DOMContentLoaded", ()=>{
    setLanguage('ar');
    loadChat();
    displayNews();
    updateVisitors();
});


// ================= التنقل مع Animation =================
function show(id){
    document.querySelectorAll(".page").forEach(s=>{
        s.classList.add("hidden");
    });

    let section = document.getElementById(id);
    section.classList.remove("hidden");

    section.style.opacity = 0;
    setTimeout(()=>{
        section.style.opacity = 1;
    }, 100);
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
        div.className = "card";
        div.innerHTML = `<h3>${n.title}</h3><p>${n.content}</p>`;
        box.appendChild(div);
    });
}


// ================= المساعد الذكي =================
function reply(){
    let input = document.getElementById("q");
    let q = input.value.trim();

    if(!q) return;

    addMessage("user", q);
    input.value = "";

    showTyping(); // 👈 يظهر "يكتب..."

    setTimeout(()=>{
        removeTyping();

        let r = generateReply(q.toLowerCase());

        addMessage("bot", r);
        speak(r);

    }, 1200); // تأخير يعطي واقعية
}

    function speak(text){
    let speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.lang = "ar-SA";
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
}
    
    setTimeout(()=>{
        let r = generateReply(q.toLowerCase());
        typeMessage(r);
speak(r);
}


// ===== إنشاء الرد =====
function generateReply(q){

    if(q.includes("ساعات") || q.includes("وقت") || q.includes("متى")){
        return "🕒 المكتبة مفتوحة من 8:30 إلى 16:30.";
    }

    if(q.includes("كتاب") || q.includes("مراجع")){
        return "📚 يمكنك البحث في الفهرس الإلكتروني أو زيارة المكتبة.";
    }

    if(q.includes("إعارة") || q.includes("استعارة")){
        return "📖 يمكنك استعارة 4 كتب لمدة أسبوع.";
    }

    if(q.includes("مكان") || q.includes("أين")){
        return "📍 المكتبة في الطابق الأول والثاني.";
    }

    if(q.includes("مرحبا") || q.includes("السلام")){
        return "👋 مرحباً بك! كيف أساعدك؟";
    }

    return "❓ لم أفهم سؤالك، حاول بصيغة أخرى.";
}


// ================= عرض الرسائل =================
function addMessage(type, text){
    let box = document.getElementById("chatbox");

    let msg = document.createElement("div");
    msg.className = "msg " + type;
    msg.textContent = text;

    box.appendChild(msg);
}

    // زر الاستماع للرد فقط للبوت
    if(type === "bot"){
        let btn = document.createElement("button");
        btn.innerHTML = "🔊";
        btn.className = "speak-btn";
        btn.onclick = () => speak(text);
        msg.appendChild(btn);
    }

    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;


// ================= typing effect 🔥 =================
function typeMessage(text){
    let box = document.getElementById("chatbox");

    let msg = document.createElement("p");
    msg.className = "msg bot";
    box.appendChild(msg);

    let i = 0;

    let interval = setInterval(()=>{
        msg.textContent += text[i];
        i++;

        if(i >= text.length){
            clearInterval(interval);
            saveChat();
        }

        box.scrollTop = box.scrollHeight;

    }, 30);
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


// ================= الإحصائيات =================
function updateVisitors(){
    let visitors = localStorage.getItem("visitors") || 0;
    visitors++;
    localStorage.setItem("visitors", visitors);

    let el = document.getElementById("visitors");
    if(el) el.textContent = visitors;
}


// ================= البحث =================
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
        box.innerHTML = "<p>❌ لا توجد نتائج</p>";
        return;
    }

    results.forEach(b=>{
        box.innerHTML += `<div class="card">📚 ${b}</div>`;
    });
}

function startVoice(){
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    recognition.lang = "ar-DZ"; // العربية الجزائرية
    recognition.start();

    recognition.onresult = function(event){
        let text = event.results[0][0].transcript;
        document.getElementById("q").value = text;
        reply(); // يرسل تلقائيًا
    };
}
    
function showTyping(){
    let box = document.getElementById("chatbox");

    let typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.id = "typing";

    typing.innerHTML = "⌛ يكتب الآن...";

    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;
}

function removeTyping(){
    let t = document.getElementById("typing");
    if(t) t.remove();
}
