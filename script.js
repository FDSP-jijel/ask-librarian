// ================= اللغة =================
function setLanguage(lang){
    document.querySelectorAll('[data-lang]').forEach(el=>{
        el.style.display = (el.getAttribute('data-lang') === lang) ? '' : 'none';
    });
}

document.addEventListener("DOMContentLoaded", ()=>{
    setLanguage('ar');
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
    let title = document.getElementById("newsTitle").value;
    let content = document.getElementById("newsContent").value;

    if(title === "" || content === "") return;

    news.push({title, content});
    localStorage.setItem("news", JSON.stringify(news));

    displayNews();
}

function displayNews(){
    let box = document.getElementById("newsList");
    box.innerHTML = "";

    news.slice().reverse().forEach(n=>{
        let div = document.createElement("div");
        div.innerHTML = "<h3>"+n.title+"</h3><p>"+n.content+"</p>";
        box.appendChild(div);
    });
}

displayNews();

// ================= المساعد =================
function reply(){
    let q = document.getElementById("q").value;
    let box = document.getElementById("chatbox");

    if(q.trim() === "") return;

    box.innerHTML += "<p>👤 "+q+"</p>";

    let r = "لم أفهم سؤالك";

    if(q.includes("ساعات")){
        r = "المكتبة من 8:30 إلى 16:30";
    }
    else if(q.includes("كتاب") || q.includes("بحث")){
        r = "يمكنك البحث في الفهرس";
    }
    else if(q.includes("إعارة")){
        r = "الإعارة 4 كتب لمدة أسبوع";
    }

    box.innerHTML += "<p>🤖 "+r+"</p>";

    box.scrollTop = box.scrollHeight;

    document.getElementById("q").value = "";
}
