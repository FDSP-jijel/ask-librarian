// التنقل بين الأقسام
function show(id){
    document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// الإعلانات
let news = JSON.parse(localStorage.getItem("news")) || [];

function addNews(){
    let title = document.getElementById("newsTitle").value;
    let content = document.getElementById("newsContent").value;

    if(title === "" || content === ""){
        alert("يرجى ملء جميع الحقول");
        return;
    }

    let item = {title, content};
    news.push(item);

    localStorage.setItem("news", JSON.stringify(news));
    displayNews();

    document.getElementById("newsTitle").value = "";
    document.getElementById("newsContent").value = "";
}

function displayNews(){
    let newsList = document.getElementById("newsList");
    newsList.innerHTML = "";

    news.slice().reverse().forEach(n => {
        let div = document.createElement("div");
        div.className = "newsItem";
        div.innerHTML = "<h3>" + n.title + "</h3><p>" + n.content + "</p>";
        newsList.appendChild(div);
    });
}

displayNews();

// المساعد الافتراضي
function reply(){
    let q = document.getElementById("q").value;
    let box = document.getElementById("chatbox");

    box.innerHTML += "<p>👤 " + q + "</p>";

    let r = "";

    if(q.includes("قانون") || q.includes("النظام")){
        r = "يمكنك الاطلاع على النظام الداخلي في قسم القوانين.";
    }
    else if(q.includes("ساعات")){
        r = "المكتبة مفتوحة من 8:30 إلى 16:30.";
    }
    else if(q.includes("كتاب") || q.includes("بحث") || q.includes("مراجع") ){
        r = "يمكنك البحث عن الكتاب عبر فهرس المكتبة أو طلب مساعدة أمين المكتبة.";
    }
    else if(q.includes("إعلان") || q.includes("نشاط")){
        r = "يمكنك مشاهدة آخر الإعلانات في قسم الإعلانات.";
    }
    else if(q.includes("استعارة")){
        r = "يمكنك استعارة الكتب وفق شروط النظام الداخلي للمكتبة.";
    }
    else{
        r = "لم أفهم سؤالك، حاول بصيغة أخرى 😊";
    }

    box.innerHTML += "<p>🤖 " + r + "</p>";
    document.getElementById("q").value = "";
}

function setLanguage(lang){
    document.querySelectorAll('[data-lang]').forEach(el=>{
        el.style.display = (el.getAttribute('data-lang') === lang) ? 'block' : 'none';
    });
}

// تعيين اللغة العربية افتراضية عند التحميل
document.addEventListener('DOMContentLoaded', ()=>{
    setLanguage('ar');
});