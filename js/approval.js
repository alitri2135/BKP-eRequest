// =====================================
// APPROVAL
// =====================================

let approval = [];
let modalApproval = null;
let selectedApproval = null;

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

        if(!currentUser){

            approval = [];
            renderApproval();
            renderStatApproval();
            return;

        }

        let url = "";

        switch(currentUser.role){

            case "Admin":
                url = API_URL + "/approval/all";
                break;

            case "Manager":
                url = API_URL + "/approval/manager";
                break;

            case "Owner":
                url = API_URL + "/approval/owner";
                break;

            default:

                approval = [];
                renderApproval();
                renderStatApproval();
                return;

        }

        const response = await fetch(url);
        const json = await response.json();

        if(!json.success){

            Swal.fire("Error", json.message, "error");

            approval = [];

        }else{

            approval = json.data || [];

        }

        renderApproval();
        renderStatApproval();

    }catch(err){

        console.error(err);

        Swal.fire("Error", err.message, "error");

    }

}

function renderApproval(){

    const tbody = document.getElementById("approvalBody");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(approval.length === 0){

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

        switch(item.STATUS){

            case "DISETUJUI":
                badge = "bg-success";
                break;

            case "DITOLAK":
                badge = "bg-danger";
                break;

            case "MENUNGGU_OWNER":
                badge = "bg-info";
                break;

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
        `${approval.length} Data`;

}

// =====================================
// DETAIL APPROVAL
// =====================================

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-detail-approval");

    if(!btn) return;

    try{

        const response = await fetch(
            API_URL + "/approval/detail/" + btn.dataset.id
        );

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

        if(json.detail.length === 0){

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        Tidak ada detail.
                    </td>
                </tr>
            `;

        }else{

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

        }

        modalApproval.show();

    }catch(err){

        console.error(err);

        Swal.fire("Error", err.message, "error");

    }

});

// =====================================
// APPROVE
// =====================================

document.addEventListener("click", async function(e){

    if(!e.target.closest("#btnApprove")) return;

    if(!selectedApproval) return;

    try{

        const currentUser = JSON.parse(localStorage.getItem("user"));

        const response = await fetch(
            API_URL + "/approval/" + selectedApproval.ID,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    aksi: "approve",
                    user: currentUser.nama
                })
            }
        );

        const json = await response.json();

        if(!json.success){

            Swal.fire("Error", json.message, "error");
            return;

        }

        Swal.fire("Sukses", json.message, "success");

        modalApproval.hide();

        selectedApproval = null;

        await loadApproval();

    }catch(err){

        console.error(err);

        Swal.fire("Error", err.message, "error");

    }

});

// =====================================
// REJECT
// =====================================

document.addEventListener("click", async function(e){

    if(!e.target.closest("#btnReject")) return;

    if(!selectedApproval) return;

    try{

        const currentUser = JSON.parse(localStorage.getItem("user"));

        const response = await fetch(
            API_URL + "/approval/" + selectedApproval.ID,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    aksi: "reject",
                    user: currentUser.nama
                })
            }
        );

        const json = await response.json();

        if(!json.success){

            Swal.fire("Error", json.message, "error");
            return;

        }

        Swal.fire("Sukses", json.message, "success");

        modalApproval.hide();

        selectedApproval = null;

        await loadApproval();

    }catch(err){

        console.error(err);

        Swal.fire("Error", err.message, "error");

    }

});

// =====================================
// STATISTIK
// =====================================

function renderStatApproval(){

    const statApproval1 = document.getElementById("statApproval1");
    const statApproval2 = document.getElementById("statApproval2");
    const statApprove = document.getElementById("statApprove");
    const statReject = document.getElementById("statReject");

    if(statApproval1){

        statApproval1.innerHTML =
            approval.filter(x => x.STATUS === "MENUNGGU_MANAGER").length;

    }

    if(statApproval2){

        statApproval2.innerHTML =
            approval.filter(x => x.STATUS === "MENUNGGU_OWNER").length;

    }

    if(statApprove){

        statApprove.innerHTML =
            approval.filter(x => x.STATUS === "DISETUJUI").length;

    }

    if(statReject){

        statReject.innerHTML =
            approval.filter(x => x.STATUS === "DITOLAK").length;

    }

}
