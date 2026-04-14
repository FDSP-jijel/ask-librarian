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
   LANGUAGE
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

    // لوحة التحكم
    if(id === "admin"){
        loadMessages();
        updateDashboard();
        drawChart();
        drawPieChart();
    }

} // ✅ إصلاح القوس

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
}

function removeTyping(){
    let t = document.getElementById("typing");
    if(t) t.remove();
}

/* =========================
   AI RESPONSE
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
            hello: "👋 مرحباً بك!",
            thanks: "😊 على الرحب والسعة!",
            default: "❓ لم أفهم سؤالك."
        }
    };

    let r = responses[lang] || responses["ar"];

    if(q.includes("وقت")) return r.hours;
    if(q.includes("كتاب")) return r.books;
    if(q.includes("استعارة")) return r.borrow;
    if(q.includes("أين")) return r.place;
    if(q.includes("مرحبا")) return r.hello;
    if(q.includes("شكرا")) return r.thanks;

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
        let r = generateReply(q);
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
}

/* =========================
   BOOK SEARCH
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

    if(!box) return;

    box.innerHTML = "";

    let results = books.filter(b =>
        b.ar.toLowerCase().includes(q) ||
        b.fr.toLowerCase().includes(q) ||
        b.en.toLowerCase().includes(q)
    );

    if(results.length === 0){
        box.innerHTML = "لا توجد نتائج";
        return;
    }

    results.forEach(b=>{
        box.innerHTML += `<p>📚 ${b.ar}</p>`;
    });
}

/* =========================
   VOICE
========================= */
function startVoice(){

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(!SpeechRecognition){
        alert("المتصفح لا يدعم الميكروفون");
        return;
    }

    let recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";

    recognition.start();

    recognition.onresult = function(event){
        let text = event.results[0][0].transcript;
        document.getElementById("q").value = text;
        reply();
    };
}

/* =========================
   CONTACT (FIXED)
========================= */
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

/* =========================
   ADMIN
========================= */
function loadMessages(){

    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let box = document.getElementById("messagesList");

    if(!box) return;

    box.innerHTML = "";

    messages.slice().reverse().forEach((m, index)=>{
        box.innerHTML += `
        <div>
            <strong>${m.name}</strong> - ${m.message}
        </div>`;
    });
}

/* =========================
   DASHBOARD
========================= */
function updateDashboard(){

    let visitors = localStorage.getItem("visitors") || 0;
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let news = JSON.parse(localStorage.getItem("news")) || [];

    document.getElementById("totalBooks").textContent = books.length;
    document.getElementById("totalVisitors").textContent = visitors;
    document.getElementById("totalMessages").textContent = messages.length;
    document.getElementById("totalNews").textContent = news.length;
}

/* =========================
   CHARTS
========================= */
let chart;
let pie;

function drawChart(){

    let visitors = localStorage.getItem("visitors") || 0;
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let news = JSON.parse(localStorage.getItem("news")) || [];

    let ctx = document.getElementById("myChart");

    if(chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["الزوار","الرسائل","الإعلانات"],
            datasets: [{
                data: [visitors, messages.length, news.length]
            }]
        }
    });
}

function drawPieChart(){

    let visitors = localStorage.getItem("visitors") || 0;
    let messages = JSON.parse(localStorage.getItem("messages")) || [];
    let news = JSON.parse(localStorage.getItem("news")) || [];

    let ctx = document.getElementById("pieChart");

    if(pie) pie.destroy();

    pie = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["الزوار","الرسائل","الإعلانات"],
            datasets: [{
                data: [visitors, messages.length, news.length]
            }]
        }
    });
}
