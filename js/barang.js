// =====================================
// MASTER BARANG
// =====================================

let barang = [];

let modalBarang = null;

let editId = null;

const API = "https://bkp-erequest-production.up.railway.app";

const kategoriList = [

    "Oli",
    "Sparepart",
    "Tools",
    "Elektrikal",
    "Ban & Velg",
    "Body",
    "Consumable",
    "Lainnya"

];

const satuanList = [

    "Pcs",
    "Unit",
    "Liter",
    "Meter",
    "Kg",
    "Box",
    "Set"

];

// =====================================
// INIT
// =====================================

function initBarang(){

    const modal=document.getElementById("barangModal");

    if(!modal) return;

    modalBarang=new bootstrap.Modal(modal);

    loadDropdown();

    loadBarang();

}

async function loadBarang(){

    try{

        const response = await fetch(API + "/barang");

        const json = await response.json();

        barang = json.data;

        renderBarang();

    }catch(err){

        console.error(err);

        Swal.fire(
            "Error",
            "Gagal mengambil data barang.",
            "error"
        );

    }

}

// =====================================
// DROPDOWN
// =====================================

function loadDropdown(){

    const kategori=document.getElementById("kategoriBarang");

    const satuan=document.getElementById("satuanBarang");

    kategori.innerHTML="";

    satuan.innerHTML="";

    kategoriList.forEach(item=>{

        kategori.innerHTML+=`

            <option value="${item}">

                ${item}

            </option>

        `;

    });

    satuanList.forEach(item=>{

        satuan.innerHTML+=`

            <option value="${item}">

                ${item}

            </option>

        `;

    });

}

// =====================================
// GENERATE KODE
// =====================================

function generateKodeBarang(){

    if(barang.length===0){

        return "BR0001";

    }

    const nomor = Math.max(

        ...barang.map(item =>

            Number(

                (item.KODE || "BR0000").replace("BR","")

            )

        )

    ) + 1;

    return "BR" +

        nomor.toString().padStart(4,"0");

}

// =====================================
// RENDER TABLE
// =====================================

function renderBarang(){

    const tbody=document.getElementById("barangBody");

    if(!tbody) return;

    tbody.innerHTML="";

    if(barang.length===0){

        tbody.innerHTML=`
        <tr>
            <td colspan="7" class="text-center py-4">
                Belum ada data barang.
            </td>
        </tr>
        `;

        document.getElementById("infoBarang").innerHTML="0 Data";

        return;

    }

    barang.forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td>${item.KODE}</td>

            <td>${item.NAMA}</td>

            <td>${item.KATEGORI}</td>

            <td>${item.SATUAN}</td>

            <td>${item.STOK}</td>

            <td>

                <span class="badge ${item.STATUS=="ACTIVE"?"bg-success":"bg-danger"}">

                    ${item.STATUS}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm btn-edit"
                    data-id="${item.ID}">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm btn-delete"
                    data-id="${item.ID}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("infoBarang").innerHTML=

        barang.length+" Data";

}

// =====================================
// TOMBOL TAMBAH
// =====================================

document.addEventListener("click",function(e){

    if(!e.target.closest("#btnTambahBarang")) return;

    editId=null;

    document.getElementById("kodeBarang").value=
        generateKodeBarang();

    document.getElementById("namaBarang").value="";

    document.getElementById("kategoriBarang").selectedIndex=0;

    document.getElementById("satuanBarang").selectedIndex=0;

    document.getElementById("stokBarang").value=0;

    document.getElementById("statusBarang").value="ACTIVE";

    document.querySelector("#barangModal .modal-title").innerHTML=
        "Tambah Barang";

    modalBarang.show();

});

// =====================================
// SIMPAN BARANG
// =====================================

document.addEventListener("click", async function (e) {

    if (!e.target.closest("#btnSimpanBarang")) return;

    const body = {

        kode: document.getElementById("kodeBarang").value,

        nama: document.getElementById("namaBarang").value.trim(),

        kategori: document.getElementById("kategoriBarang").value,

        satuan: document.getElementById("satuanBarang").value,

        stok: Number(document.getElementById("stokBarang").value),

        status: document.getElementById("statusBarang").value

    };

    if (body.nama === "") {

        Swal.fire(
            "Peringatan",
            "Nama barang wajib diisi.",
            "warning"
        );

        return;

    }

    try {

        let response;

        if (editId == null) {

            response = await fetch(API + "/barang", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)

            });

        } else {

            body.id = editId;

            response = await fetch(API + "/barang/" + editId, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)

            });

        }

        const res = await response.json();

        if (!res.success) {

            Swal.fire(
                "Error",
                res.message,
                "error"
            );

            return;

        }

        Swal.fire({

            icon: "success",

            title: "Berhasil",

            text: res.message,

            timer: 1200,

            showConfirmButton: false

        });

        modalBarang.hide();

        editId = null;

        loadBarang();

    } catch (err) {

        console.error(err);

        Swal.fire(
            "Error",
            "Gagal menyimpan data.",
            "error"
        );

    }

});

// =====================================
// EDIT BARANG
// =====================================

document.addEventListener("click", function(e){

    const btn = e.target.closest(".btn-edit");

    if(!btn) return;

    editId = btn.dataset.id;

    const data = barang.find(item => item.ID === editId);

    if(!data) return;

    document.getElementById("kodeBarang").value = data.KODE;
    document.getElementById("namaBarang").value = data.NAMA;
    document.getElementById("kategoriBarang").value = data.KATEGORI;
    document.getElementById("satuanBarang").value = data.SATUAN;
    document.getElementById("stokBarang").value = data.STOK;
    document.getElementById("statusBarang").value = data.STATUS;

    document.querySelector("#barangModal .modal-title").innerHTML =
        "Edit Barang";

    modalBarang.show();

});


// =====================================
// HAPUS BARANG
// =====================================

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-delete");

    if(!btn) return;

    const id = btn.dataset.id;

    const result = await Swal.fire({

        title:"Hapus Barang?",
        text:"Data yang dihapus tidak dapat dikembalikan.",
        icon:"warning",
        showCancelButton:true,
        confirmButtonText:"Ya, Hapus",
        cancelButtonText:"Batal"

    });

    if(!result.isConfirmed) return;

    try{

        const response = await fetch(API + "/barang/" + id,{

            method:"DELETE"

        });

        const res = await response.json();
        console.log("Status HTTP:", response.status);
        console.log("Response:", res);
        if(!res.success){

            Swal.fire(
                "Error",
                res.message,
                "error"
            );

            return;

        }

        Swal.fire({

            icon:"success",

            title:"Berhasil",

            text:res.message,

            timer:1200,

            showConfirmButton:false

        });

        await loadBarang();

    }catch(err){

        console.error(err);

        Swal.fire(

            "Error",

            "Gagal menghapus barang.",

            "error"

        );

    }

});

// =====================================
// SEARCH
// =====================================

document.addEventListener("input",function(e){

    if(e.target.id!="searchBarang") return;

    const keyword=e.target.value.toLowerCase();

    const tbody=document.getElementById("barangBody");

    tbody.innerHTML="";

    
    const hasil = barang.filter(item =>

        item.KODE.toLowerCase().includes(keyword) ||

        item.NAMA.toLowerCase().includes(keyword) ||

        item.KATEGORI.toLowerCase().includes(keyword)

    );

    if(hasil.length===0){

        tbody.innerHTML=`

        <tr>

            <td colspan="7" class="text-center py-4">

                Data tidak ditemukan.

            </td>

        </tr>

        `;

        return;

    }

    hasil.forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td>${item.KODE}</td>

            <td>${item.NAMA}</td>

            <td>${item.KATEGORI}</td>

            <td>${item.SATUAN}</td>

            <td>${item.STOCK}</td>

            <td>

                <span class="badge ${item.STATUS=="ACTIVE"?"bg-success":"bg-danger"}">

                    ${item.STATUS}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm btn-edit"
                    data-id="${item.ID}">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm btn-delete"
                    data-id="${item.ID}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

});
