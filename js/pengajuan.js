// =====================================
// PENGAJUAN
// =====================================

let pengajuan = [];

let detailPengajuan = [];

let daftarBarang = [];

let modalPengajuan = null;

let editPengajuanId = null;

// =====================================
// INIT
// =====================================

function initPengajuan(){

    console.log("initPengajuan jalan");

    const modal=document.getElementById("pengajuanModal");

    console.log(modal);

    if(!modal) return;

    modalPengajuan=new bootstrap.Modal(modal);

    loadBarangPengajuan();

    loadPengajuan();

}

// =====================================
// LOAD PENGAJUAN
// =====================================

async function loadPengajuan(){

    try{

        const response=await fetch(API_URL+"/pengajuan");

        const json=await response.json();

        pengajuan=json.data;

        renderPengajuan();

    }

    catch(err){

        console.error(err);

        Swal.fire(

            "Error",

            "Gagal mengambil data pengajuan.",

            "error"

        );

    }

}

// =====================================
// LOAD BARANG
// =====================================

async function loadBarangPengajuan(){

    try{

        const response=await fetch(API_URL+"/barang");

        const json=await response.json();

        daftarBarang=json.data;

        const select=document.getElementById("barangPengajuan");

        if(!select) return;

        select.innerHTML="";

        daftarBarang.forEach(item=>{

            select.innerHTML+=`

                <option value="${item.ID}">

                    ${item.KODE} - ${item.NAMA}

                </option>

            `;

        });

        updateSatuan();

    }

    catch(err){

        console.log(err);

    }

}

// =====================================
// UPDATE SATUAN
// =====================================

function updateSatuan(){

    const id=document.getElementById("barangPengajuan").value;

    const barang=daftarBarang.find(x=>x.ID==id);

    console.log(barang);

    if(!barang) return;

    document.getElementById("satuanPengajuan").value=

        barang.SATUAN;

}

// =====================================
// GANTI BARANG
// =====================================

document.addEventListener("change", function(e){

    if(e.target.id == "barangPengajuan"){

        updateSatuan();

    }

});

// =====================================
// RENDER PENGAJUAN
// =====================================

function renderPengajuan(){

    const tbody=document.getElementById("pengajuanBody");

    if(!tbody) return;

    tbody.innerHTML="";

    if(pengajuan.length==0){

        tbody.innerHTML=`

        <tr>

            <td colspan="7" class="text-center py-4">

                Belum ada pengajuan.

            </td>

        </tr>

        `;

        document.getElementById("infoPengajuan").innerHTML="0 Data";

        return;

    }

    pengajuan.forEach((item,index)=>{

        let badge="bg-warning";

        if(item.STATUS=="MENUNGGU_OWNER")
            badge="bg-info";

        if(item.STATUS=="DISETUJUI")
            badge="bg-success";

        if(item.STATUS=="DITOLAK")
            badge="bg-danger";

        tbody.innerHTML+=`

        <tr>

            <td>${index+1}</td>

            <td>${item.NO_REQUEST}</td>

            <td>${item.TANGGAL}</td>

            <td>${item.USER}</td>

            <td>1 Item</td>

            <td>

                <span class="badge ${badge}">

                    ${item.STATUS}

                </span>

            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm btn-edit-pengajuan"
                    data-id="${item.ID}">

                    <i class="bi bi-pencil"></i>

                </button>

                <button
                    class="btn btn-danger btn-sm btn-delete-pengajuan"
                    data-id="${item.ID}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("infoPengajuan").innerHTML=

        pengajuan.length+" Data";

}

// =====================================
// RENDER DETAIL PENGAJUAN
// =====================================

function renderDetailPengajuan(){

    const tbody=document.getElementById("detailPengajuanBody");

    tbody.innerHTML="";

    if(detailPengajuan.length==0){

        tbody.innerHTML=`

        <tr>

            <td colspan="6" class="text-center text-secondary">

                Belum ada barang.

            </td>

        </tr>

        `;

        return;

    }

    detailPengajuan.forEach((item,index)=>{

        tbody.innerHTML+=`

        <tr>

            <td>${index+1}</td>

            <td>${item.kode}</td>

            <td>${item.nama}</td>

            <td>${item.qty}</td>

            <td>${item.satuan}</td>

            <td>

                <button
                    class="btn btn-danger btn-sm btn-hapus-item"
                    data-index="${index}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}

// =====================================
// TAMBAH ITEM
// =====================================

document.addEventListener("click",function(e){

    if(!e.target.closest("#btnTambahItem")) return;

    const id=document.getElementById("barangPengajuan").value;

    const qty=document.getElementById("qtyPengajuan").value;

    if(id=="" || qty==""){

        Swal.fire(

            "Peringatan",

            "Barang dan Qty wajib diisi.",

            "warning"

        );

        return;

    }

    const barang=daftarBarang.find(x=>x.ID==id);

    detailPengajuan.push({

        id:barang.ID,

        kode:barang.KODE,

        nama:barang.NAMA,

        satuan:barang.SATUAN,

        qty:qty

    });

    renderDetailPengajuan();

    document.getElementById("qtyPengajuan").value="";

});

// =====================================
// HAPUS ITEM
// =====================================

document.addEventListener("click",function(e){

    const btn=e.target.closest(".btn-hapus-item");

    if(!btn) return;

    detailPengajuan.splice(btn.dataset.index,1);

    renderDetailPengajuan();

});



// =====================================
// TOMBOL TAMBAH
// =====================================

document.addEventListener("click",function(e){

    if(!e.target.closest("#btnTambahPengajuan")) return;

    editPengajuanId = null;

    detailPengajuan = [];

    renderDetailPengajuan();

    document.getElementById("tanggalPengajuan").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("namaPengaju").value = "";

    document.getElementById("keteranganPengajuan").value = "";

    document.getElementById("qtyPengajuan").value = "";

    document.getElementById("noPengajuan").value = "Auto Generate";

    console.log(modalPengajuan);
    
    modalPengajuan.show();

});

// =====================================
// SIMPAN PENGAJUAN
// =====================================

document.addEventListener("click", async function(e){

    if(!e.target.closest("#btnSimpanPengajuan")) return;

    if(detailPengajuan.length==0){

        Swal.fire(

            "Peringatan",

            "Tambahkan minimal 1 barang.",

            "warning"

        );

        return;

    }

    const body={

        tanggal:document.getElementById("tanggalPengajuan").value,

        user:document.getElementById("namaPengaju").value,

        keterangan:document.getElementById("keteranganPengajuan").value,

        detail:detailPengajuan

    };

    try{

        console.log(detailPengajuan);
        const response=await fetch(API_URL+"/pengajuan",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(body)

        });

        const res=await response.json();

        Swal.fire({

            icon:"success",

            title:"Berhasil",

            text:res.message,

            timer:1500,

            showConfirmButton:false

        });

        modalPengajuan.hide();

        loadPengajuan();

    }

    catch(err){

        console.log(err);

        Swal.fire(

            "Error",

            "Gagal menyimpan pengajuan.",

            "error"

        );

    }

});

// =====================================
// HAPUS PENGAJUAN
// =====================================

document.addEventListener("click", async function(e){

    const btn = e.target.closest(".btn-delete-pengajuan");

    if(!btn) return;

    const id = btn.dataset.id;

    const konfirmasi = await Swal.fire({

        title:"Hapus Pengajuan?",

        text:"Header dan detail pengajuan akan dihapus.",

        icon:"warning",

        showCancelButton:true,

        confirmButtonText:"Ya",

        cancelButtonText:"Batal"

    });

    if(!konfirmasi.isConfirmed) return;

    try{

        const response = await fetch(API_URL+"/pengajuan/"+id,{

            method:"DELETE"

        });

        const res = await response.json();

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

        loadPengajuan();

    }

    catch(err){

        console.log(err);

        Swal.fire(

            "Error",

            "Gagal menghapus pengajuan.",

            "error"

        );

    }

});