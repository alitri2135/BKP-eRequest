/* ==========================================
   BKP e-Request
   Main App
========================================== */

const pages = {

    dashboard: "pages/dashboard.html",

    barang: "pages/barang.html",

    pengajuan: "pages/pengajuan.html",

    approval: "pages/approval.html",

    user: "pages/user.html"

};

/* ==========================================
   LOAD PAGE
========================================== */

async function loadPage(page){

const response=await fetch(pages[page]);

const html=await response.text();

document.getElementById("content").innerHTML=html;

document.querySelector(".topbar h4").innerHTML=
page.charAt(0).toUpperCase()+page.slice(1);

if(page=="barang"){

    setTimeout(()=>{

        console.log("initBarang jalan");
        initBarang();

    },100);

}

if(page=="user"){

    setTimeout(()=>{

        initUser();

    },100);

}

if(page=="pengajuan"){

    setTimeout(()=>{

        initPengajuan();

    },100);

}

if(page=="approval"){

    setTimeout(()=>{

        initApproval();

    },100);

}

if(page=="dashboard"){

    setTimeout(()=>{

        updateDashboard();


    },100);

}

}

// ======================================
// DASHBOARD
// ======================================

async function updateDashboard(){

    const response = await fetch(API_URL + "/dashboard");
    const json = await response.json();

    if(!json.success) return;

    const data = json.data || [];
    const activity = json.activity || [];

    document.getElementById("dashTotalPengajuan").innerHTML =
        data.length;

    document.getElementById("dashPending").innerHTML =
        data.filter(x =>
            x.STATUS == "MENUNGGU_MANAGER" ||
            x.STATUS == "MENUNGGU_OWNER"
        ).length;

    document.getElementById("dashApprove").innerHTML =
        data.filter(x =>
            x.STATUS == "DISETUJUI"
        ).length;

    document.getElementById("dashReject").innerHTML =
        data.filter(x =>
            x.STATUS == "DITOLAK"
        ).length;

    // ==========================
    // RECENT ACTIVITY
    // ==========================

    const tbody = document.getElementById("activityBody");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(activity.length === 0){

        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-secondary">
                    Belum ada aktivitas.
                </td>
            </tr>
        `;

        return;

    }

    activity.forEach(item=>{

        tbody.innerHTML += `
            <tr>
                <td>${item.WAKTU}</td>
                <td>
                    <b>${item.USER}</b><br>
                    <small>${item.AKTIVITAS}</small>
                </td>
            </tr>
        `;

    });

}

/* ==========================================
   SIDEBAR
========================================== */

document.querySelectorAll(".sidebar li").forEach(item=>{

    item.addEventListener("click",function(){

        document.querySelectorAll(".sidebar li")
        .forEach(i=>i.classList.remove("active"));

        this.classList.add("active");

        const page=this.dataset.page;

        if(page){

            loadPage(page);

        }

    });

});


function applyRoleMenu(){

    const user = JSON.parse(localStorage.getItem("user"));

    if(!user) return;

    // tampilkan semua dulu
    document.getElementById("menuDashboard").style.display = "";
    document.getElementById("menuBarang").style.display = "";
    document.getElementById("menuPengajuan").style.display = "";
    document.getElementById("menuApproval").style.display = "";
    document.getElementById("menuUser").style.display = "";

    switch(user.role){

        case "Admin":

            // Admin lihat semua
            break;

        case "Pengaju":

            document.getElementById("menuBarang").style.display = "none";
            document.getElementById("menuApproval").style.display = "none";
            document.getElementById("menuUser").style.display = "none";

            break;

        case "Manager":

            document.getElementById("menuBarang").style.display = "none";
            document.getElementById("menuPengajuan").style.display = "none";
            document.getElementById("menuUser").style.display = "none";

            break;

        case "Owner":

            document.getElementById("menuBarang").style.display = "none";
            document.getElementById("menuPengajuan").style.display = "none";
            document.getElementById("menuUser").style.display = "none";

            break;

    }

}

/* ==========================================
   START APP
========================================== */

window.onload = function(){

    console.log("ONLOAD");
    console.log(localStorage.getItem("user"));

    const user = localStorage.getItem("user");

    if(user){

        const data = JSON.parse(user);

        console.log("LOGIN DARI STORAGE", data);

        document.getElementById("username").innerHTML = data.nama;

        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("app").style.display = "flex";

        applyRoleMenu();

        switch(data.role){

            case "Admin":
                loadPage("dashboard");
                break;

            case "Pengaju":
                loadPage("pengajuan");
                break;

            case "Manager":
            case "Owner":
                loadPage("approval");
                break;
        }

    }else{

        console.log("BELUM LOGIN");

        document.getElementById("loginOverlay").style.display = "flex";
        document.getElementById("app").style.display = "none";

    }

};

document.getElementById("menuLogout").addEventListener("click", function(){

    localStorage.removeItem("user");

    location.reload();

});
