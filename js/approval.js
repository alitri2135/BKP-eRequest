// =====================================
// APPROVAL
// =====================================

let approval = [];

let modalApproval = null;

let selectedApproval = null;

const currentUser = JSON.parse(localStorage.getItem("user"));

// =====================================
// INIT
// =====================================

async function initApproval(){

    const modal = document.getElementById("approvalModal");

    if(!modal) return;

    modalApproval = new bootstrap.Modal(modal);

    await loadApproval();

}

// =====================================
// LOAD APPROVAL
// =====================================

async function loadApproval(){

    try{

        const currentUser = JSON.parse(localStorage.getItem("user"));

        let url = "";

        if(currentUser.role == "Admin"){

            url = API_URL + "/approval/all";

        }else if(currentUser.role == "Manager"){

            url = API_URL + "/approval/manager";

        }else if(currentUser.role == "Owner"){

            url = API_URL + "/approval/owner";

        }else{

            approval = [];
            renderApproval();
            renderStatApproval();
            return;

        }

        console.log("URL:", url);
        
        const response = await fetch(url);
        
        console.log("STATUS:", response.status);
        
        const json = await response.json();
        
        console.log("JSON:", json);
        
        approval = json.data || [];
        
        console.log("APPROVAL:", approval);
        
        renderApproval();
        renderStatApproval();

    }catch(err){

        console.log(err);

    }

}

// =====================================
// RENDER
// =====================================

// =====================================
// RENDER
// =====================================

function renderApproval(){

    const tbody = document.getElementById("approvalBody");

    tbody.innerHTML = "";

    if(approval.length == 0){

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Belum ada data.
                </td>
            </tr>
        `;

        document.getElementById("infoApproval").innerHTML = "0 Data";

        return;

    }

    approval.forEach((item,index)=>{

        let badge = "bg-warning";

        if(item.STATUS == "DISETUJUI"){

            badge = "bg-success";

        }else if(item.STATUS == "DITOLAK"){

            badge = "bg-danger";

        }else if(item.STATUS == "MENUNGGU_OWNER"){

            badge = "bg-info";

        }

        tbody.innerHTML += `
            <tr>

                <td>${index+1}</td>

                <td>${item.NO_REQUEST}</td>

                <td>${item.TANGGAL}</td>

                <td>${item.USER}</td>

                <td>${item.TOTAL_ITEM}</td>

                <td>
                    <span class="badge ${badge}">
                        ${item.STATUS}
                    </span>
                </td>

                <td>
                    <button
                        class="btn btn-primary btn-sm btn-detail-approval"
                        data-id="${item.ID}">
                        Detail
                    </button>
                </td>

            </tr>
        `;

    });

    document.getElementById("infoApproval").innerHTML =
        approval.length + " Data";

}

// =====================================
// DETAIL APPROVAL
// =====================================

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-detail-approval");

    if(!btn) return;

    const id = btn.dataset.id;

    selectedApproval = id;

    try{

        const response = await fetch(API_URL + "/approval/detail/" + id);

        const json = await response.json();

        console.log(json);

    }catch(err){

        console.log(err);

    }

});

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-detail-approval");
    if(!btn) return;

    const id = btn.dataset.id;

    try{

        const response = await fetch(API_URL + "/approval/detail/" + id);
        const json = await response.json();

        if(!json.success){
            Swal.fire("Error", json.message, "error");
            return;
        }

        selectedApproval = json.header;

        document.getElementById("approvalDetail").innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <b>No Pengajuan</b><br>
                    ${json.header.NO_REQUEST}
                </div>

                <div class="col-md-4">
                    <b>Pengaju</b><br>
                    ${json.header.USER}
                </div>

                <div class="col-md-4">
                    <b>Status</b><br>
                    ${json.header.STATUS}
                </div>
            </div>
        `;

        const tbody = document.getElementById("approvalDetailBody");
        tbody.innerHTML = "";

        json.detail.forEach((item,index)=>{

            tbody.innerHTML += `
                <tr>
                    <td>${index+1}</td>
                    <td>-</td>
                    <td>${item.BARANG}</td>
                    <td>${item.QTY}</td>
                    <td>${item.SATUAN}</td>
                </tr>
            `;

        });

        modalApproval.show();

    }catch(err){

        console.log(err);

    }

});

document.addEventListener("click", async function(e){

    if(!e.target.closest("#btnApprove")) return;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    console.log(currentUser);

    const response = await fetch(API_URL+"/approval/"+selectedApproval.ID,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            aksi:"approve",
            user:currentUser.nama

        })

    });

    const json = await response.json();

    if(json.success){

        Swal.fire("Sukses", json.message, "success");

        modalApproval.hide();

        loadApproval();

    }else{

        Swal.fire("Error", json.message, "error");

    }

});

document.addEventListener("click", async function(e){

    if(!e.target.closest("#btnReject")) return;

    const response = await fetch(API_URL+"/approval/"+selectedApproval.ID,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            aksi:"reject",
            user:currentUser.nama

        })

    });

    const json = await response.json();

    if(json.success){

        Swal.fire("Sukses", json.message, "success");

        modalApproval.hide();

        loadApproval();

    }else{

        Swal.fire("Error", json.message, "error");

    }

});

function renderStatApproval(){

    document.getElementById("statApproval1").innerHTML =
        approval.filter(x => x.STATUS == "MENUNGGU_MANAGER").length;

    document.getElementById("statApproval2").innerHTML =
        approval.filter(x => x.STATUS == "MENUNGGU_OWNER").length;

    document.getElementById("statApprove").innerHTML =
        approval.filter(x => x.STATUS == "DISETUJUI").length;

    document.getElementById("statReject").innerHTML =
        approval.filter(x => x.STATUS == "DITOLAK").length;

}

function updateApprovalDashboard(){

    const approval1 = pengajuan.filter(item =>
        item.status === "Menunggu Approval 1"
    ).length;

    const approval2 = pengajuan.filter(item =>
        item.status === "Menunggu Approval 2"
    ).length;

    const disetujui = pengajuan.filter(item =>
        item.status === "Disetujui"
    ).length;

    const ditolak = pengajuan.filter(item =>
        item.status === "Ditolak"
    ).length;

    document.getElementById("approval1Total").innerHTML = approval1;
    document.getElementById("approval2Total").innerHTML = approval2;
    document.getElementById("approvalSetuju").innerHTML = disetujui;
    document.getElementById("approvalTolak").innerHTML = ditolak;

}
