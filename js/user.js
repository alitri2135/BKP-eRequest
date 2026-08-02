// =====================================
// MASTER USER
// =====================================

let users = [];

let modalUser = null;

let editUserId = null;


// =====================================
// INIT
// =====================================

function initUser(){

    const modal=document.getElementById("userModal");

    if(!modal) return;

    modalUser=new bootstrap.Modal(modal);

    loadUser();

}

// =====================================
// LOAD USER
// =====================================

async function loadUser(){

    try{

        const response=await fetch(API+"/users");

        const json=await response.json();

        users=json.data;

        renderUser();

    }

    catch(err){

        console.error(err);

        Swal.fire(

            "Error",

            "Gagal mengambil data user.",

            "error"

        );

    }

}

// =====================================
// RENDER USER
// =====================================

function renderUser(){

    const tbody=document.getElementById("userBody");

    if(!tbody) return;

    tbody.innerHTML="";

    if(users.length===0){

        tbody.innerHTML=`

        <tr>

            <td colspan="5" class="text-center py-4">

                Belum ada data user.

            </td>

        </tr>

        `;

        document.getElementById("infoUser").innerHTML="0 Data";

        return;

    }

    users.forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td>${item.NAMA}</td>

            <td>${item.USERNAME}</td>

            <td>${item.ROLE}</td>

            <td>

                <span class="badge ${item.STATUS=="ACTIVE"?"bg-success":"bg-danger"}">

                    ${item.STATUS}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm btn-edit-user"
                    data-id="${item.ID}">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm btn-delete-user"
                    data-id="${item.ID}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("infoUser").innerHTML=

        users.length+" Data";

}

// =====================================
// TOMBOL TAMBAH USER
// =====================================

document.addEventListener("click", function(e){

    if(!e.target.closest("#btnTambahUser")) return;

    console.log("klik");
    console.log(modalUser);

    editUserId = null;

    document.getElementById("namaUser").value = "";
    document.getElementById("usernameUser").value = "";
    document.getElementById("passwordUser").value = "";
    document.getElementById("roleUser").value = "Admin";
    document.getElementById("statusUser").value = "Aktif";

    document.querySelector("#userModal .modal-title").innerHTML =
        "Tambah User";

    modalUser.show();

    console.log("show selesai");

});

// =====================================
// SIMPAN USER
// =====================================

document.addEventListener("click", async function(e){

    if(!e.target.closest("#btnSimpanUser")) return;

    const body={

        nama:document.getElementById("namaUser").value.trim(),

        username:document.getElementById("usernameUser").value.trim(),

        password:document.getElementById("passwordUser").value,

        role:document.getElementById("roleUser").value,

        status:
            document.getElementById("statusUser").value == "Aktif"
                ? "ACTIVE"
                : "INACTIVE"


    };

    if(body.nama=="" || body.username=="" || body.password==""){

        Swal.fire(

            "Peringatan",

            "Semua field wajib diisi.",

            "warning"

        );

        return;

    }

    try{

        let response;

        if(editUserId==null){

            response = await fetch(API+"/users",{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(body)

            });

        }else{

            response = await fetch(API+"/users/"+editUserId,{

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify(body)

            });

        }

        const res=await response.json();

        Swal.fire({

            icon:"success",

            title:"Berhasil",

            text:res.message,

            timer:1200,

            showConfirmButton:false

        });

        modalUser.hide();

        editUserId = null;

        loadUser();

    }

    catch(err){

        console.error(err);

        Swal.fire(

            "Error",

            "Gagal menyimpan user.",

            "error"

        );

    }

});

// =====================================
// EDIT USER
// =====================================

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-edit-user");

    if(!btn) return;

    editUserId = btn.dataset.id;

    try{

        const response = await fetch(API + "/users");

        const json = await response.json();

        const user = json.data.find(item => item.ID == editUserId);

        if(!user) return;

        document.getElementById("namaUser").value = user.NAMA;
        document.getElementById("usernameUser").value = user.USERNAME;
        document.getElementById("passwordUser").value = "";
        document.getElementById("roleUser").value = user.ROLE;
        document.getElementById("statusUser").value =
            user.STATUS == "ACTIVE" ? "Aktif" : "Nonaktif";

        document.querySelector("#userModal .modal-title").innerHTML =
            "Edit User";

        modalUser.show();

    }catch(err){

        console.error(err);

    }

});

// =====================================
// HAPUS USER
// =====================================

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-delete-user");

    if(!btn) return;

    const id = btn.dataset.id;

    const konfirmasi = await Swal.fire({

        title:"Hapus User?",

        text:"Data yang dihapus tidak dapat dikembalikan.",

        icon:"warning",

        showCancelButton:true,

        confirmButtonText:"Ya",

        cancelButtonText:"Batal"

    });

    if(!konfirmasi.isConfirmed) return;

    try{

        const response = await fetch(API+"/users/"+id,{

            method:"DELETE"

        });

        const res = await response.json();

        Swal.fire({

            icon:"success",

            title:"Berhasil",

            text:res.message,

            timer:1200,

            showConfirmButton:false

        });

        loadUser();

    }catch(err){

        console.error(err);

        Swal.fire(

            "Error",

            "Gagal menghapus user.",

            "error"

        );

    }

});



