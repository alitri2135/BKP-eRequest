console.log("SERVER START");

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

// =====================================
// GOOGLE AUTH
// =====================================

if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error("GOOGLE_CREDENTIALS belum diset di Environment Variables");
}

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]
});

const sheets = google.sheets({

    version: "v4",
    auth

});

// =====================================
// CONFIG
// =====================================

const PORT = process.env.PORT || 3000;

const SPREADSHEET_ID =
    "1DlBjhF4cMIhyoZIVNxVqlf9i2090HhJ8BnDPmNggH88";

// =====================================
// HELPER
// =====================================

function nowJakarta() {

    return new Date().toLocaleString("id-ID", {

        timeZone: "Asia/Jakarta"

    });

}

// =====================================
// ACTIVITY LOG
// =====================================

async function saveActivity(

    user,
    aktivitas,
    keterangan

) {

    try {

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: "ActivityLog!A:E"

        });

        const rows = result.data.values || [];

        rows.push([

            crypto.randomUUID(),

            user,

            aktivitas,

            keterangan,

            nowJakarta()

        ]);

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "ActivityLog!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: rows

            }

        });

    } catch (err) {

        console.log("Activity Log Error");

        console.log(err);

    }

}

// =====================================
// LOGIN
// =====================================

app.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {

            return res.json({

                success: false,
                message: "Username dan Password wajib diisi."

            });

        }

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: "Users!A:G"

        });

        const rows = result.data.values || [];

        rows.shift();

        const hash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const user = rows.find(r =>

            r[2] === username &&
            r[3] === hash &&
            r[5] === "ACTIVE"

        );

        if (!user) {

            return res.json({

                success: false,
                message: "Username atau Password salah."

            });

        }

        await saveActivity(

            user[1],
            "LOGIN",
            "Login ke sistem"

        );

        res.json({

            success: true,

            user: {

                id: user[0],
                nama: user[1],
                username: user[2],
                role: user[4]

            }

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// DASHBOARD
// =====================================

app.get("/dashboard", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: "Pengajuan!A:L"

        });

        const rows = result.data.values || [];

        rows.shift();

        const data = rows.map(r => ({

            ID: r[0],
            NO_REQUEST: r[1],
            TANGGAL: r[2],
            USER: r[3],
            TOTAL_ITEM: Number(r[4] || 0),
            KETERANGAN: r[5],
            STATUS: r[6],
            APPROVAL1: r[7],
            APPROVAL2: r[8],
            APPROVED_AT: r[9],
            CREATED_AT: r[10]

        }));

        res.json({

            success: true,
            data

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// GET BARANG
// =====================================

app.get("/barang", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Barang!A:H"

        });

        const rows = result.data.values || [];

        rows.shift();

        const data = rows.map(r => ({

            ID: r[0],
            KODE: r[1],
            NAMA: r[2],
            KATEGORI: r[3],
            SATUAN: r[4],
            STOK: Number(r[5] || 0),
            STATUS: r[6],
            CREATED_AT: r[7]

        }));

        res.json({

            success: true,
            data

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// TAMBAH BARANG
// =====================================

app.post("/barang", async (req, res) => {

    try {

        const {

            kode,
            nama,
            kategori,
            satuan,
            stok,
            namaUser

        } = req.body;

        if (
            !kode ||
            !nama ||
            !kategori ||
            !satuan ||
            stok === undefined
        ) {

            return res.json({

                success: false,
                message: "Semua data barang wajib diisi."

            });

        }

        const cek = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Barang!A:H"

        });

        const rows = cek.data.values || [];

        rows.shift();

        const sudahAda = rows.find(r => r[1] === kode);

        if (sudahAda) {

            return res.json({

                success: false,
                message: "Kode barang sudah digunakan."

            });

        }

        await sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: "Barang!A:H",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [[

                    crypto.randomUUID(),
                    kode,
                    nama,
                    kategori,
                    satuan,
                    stok,
                    "ACTIVE",
                    nowJakarta()

                ]]

            }

        });

        await saveActivity(

            namaUser || "SYSTEM",
            "TAMBAH BARANG",
            nama

        );

        res.json({

            success: true,
            message: "Barang berhasil ditambahkan."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// UPDATE BARANG
// =====================================

app.put("/barang/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const {

            nama,
            kategori,
            satuan,
            stok,
            status

        } = req.body;

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Barang!A:H"

        });

        const rows = result.data.values || [];

        const header = rows.shift();

        const index = rows.findIndex(r => r[0] === id);

        if (index === -1) {

            return res.json({

                success: false,
                message: "Barang tidak ditemukan."

            });

        }

        rows[index] = [

            id,
            rows[index][1],
            nama,
            kategori,
            satuan,
            stok,
            status,
            rows[index][7]

        ];

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "Barang!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [

                    header,
                    ...rows

                ]

            }

        });

        res.json({

            success: true,
            message: "Barang berhasil diupdate."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// DELETE BARANG
// =====================================

app.delete("/barang/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Barang!A:H"

        });

        const rows = result.data.values || [];

        const header = rows.shift();

        const index = rows.findIndex(r => r[0] === id);

        if (index === -1) {

            return res.json({

                success: false,
                message: "Barang tidak ditemukan."

            });

        }

        rows.splice(index, 1);

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "Barang!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [

                    header,
                    ...rows

                ]

            }

        });

        res.json({

            success: true,
            message: "Barang berhasil dihapus."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// GET PENGAJUAN
// =====================================

app.get("/pengajuan", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"

        });

        const rows = result.data.values || [];

        rows.shift();

        const data = rows.map(r => ({

            ID: r[0],
            NO_REQUEST: r[1],
            TANGGAL: r[2],
            USER: r[3],
            TOTAL_ITEM: Number(r[4] || 0),
            KETERANGAN: r[5],
            STATUS: r[6],
            APPROVAL1: r[7],
            APPROVAL2: r[8],
            APPROVED_AT: r[9],
            CREATED_AT: r[10]

        }));

        res.json({

            success: true,
            data

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// TAMBAH PENGAJUAN
// =====================================

app.post("/pengajuan", async (req, res) => {

    try {

        const {

            tanggal,
            user,
            keterangan,
            detail

        } = req.body;

        if (
            !tanggal ||
            !user ||
            !Array.isArray(detail) ||
            detail.length === 0
        ) {

            return res.json({

                success: false,
                message: "Data pengajuan belum lengkap."

            });

        }

        const id = crypto.randomUUID();

        const noRequest = "REQ-" + Date.now();

        const created = nowJakarta();

        // HEADER

        await sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: "Pengajuan!A:L",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [[

                    id,
                    noRequest,
                    tanggal,
                    user,
                    detail.length,
                    keterangan,
                    "MENUNGGU_MANAGER",
                    "",
                    "",
                    "",
                    created

                ]]

            }

        });

        // DETAIL

        const detailRows = detail.map(item => [

            crypto.randomUUID(),
            id,
            item.nama,
            item.qty,
            item.satuan,
            created

        ]);

        await sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: "DetailPengajuan!A:F",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: detailRows

            }

        });

        await saveActivity(

            user,
            "PENGAJUAN",
            noRequest

        );

        res.json({

            success: true,
            message: "Pengajuan berhasil dibuat."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =====================================
// HAPUS PENGAJUAN
// =====================================

app.delete("/pengajuan/:id", async (req, res) => {

    try {

        const id = req.params.id;

        // HEADER

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"

        });

        const rows = result.data.values || [];

        const header = rows.shift();

        const data = rows.filter(r => r[0] !== id);

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "Pengajuan!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [

                    header,
                    ...data

                ]

            }

        });

        // DETAIL

        const detailResult = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "DetailPengajuan!A:F"

        });

        const detailRows = detailResult.data.values || [];

        const detailHeader = detailRows.shift();

        const detailData = detailRows.filter(r => r[1] !== id);

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "DetailPengajuan!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [

                    detailHeader,
                    ...detailData

                ]

            }

        });

        res.json({

            success: true,
            message: "Pengajuan berhasil dihapus."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =========================
// APPROVAL MANAGER
// =========================

app.get("/approval/manager", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"
        });

        const rows = result.data.values || [];
        rows.shift();

        const data = rows
            .map(r => ({
                ID: r[0],
                NO_REQUEST: r[1],
                TANGGAL: r[2],
                USER: r[3],
                TOTAL_ITEM: r[4],
                KETERANGAN: r[5],
                STATUS: r[6],
                APPROVAL1: r[7],
                APPROVAL2: r[8],
                APPROVED_AT: r[9],
                CREATED_AT: r[10]
            }))
            .filter(x => x.STATUS === "MENUNGGU_MANAGER");

        res.json({
            success: true,
            data
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: err.message
        });

    }

});

// =========================
// DETAIL APPROVAL
// =========================

app.get("/approval/detail/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"
        });

        const rows = result.data.values || [];
        rows.shift();

        const row = rows.find(r => r[0] == id);

        if (!row) {

            return res.json({
                success: false,
                message: "Data tidak ditemukan"
            });

        }

        const header = {
            ID: row[0],
            NO_REQUEST: row[1],
            TANGGAL: row[2],
            USER: row[3],
            TOTAL_ITEM: row[4],
            KETERANGAN: row[5],
            STATUS: row[6]
        };

        const detailResult = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "DetailPengajuan!A:F"
        });

        const detailRows = detailResult.data.values || [];
        detailRows.shift();

        const detail = detailRows
            .filter(r => r[1] == id)
            .map(r => ({
                ID: r[0],
                BARANG: r[2],
                QTY: r[3],
                SATUAN: r[4]
            }));

        res.json({
            success: true,
            header,
            detail
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: err.message
        });

    }

});

// =========================
// APPROVE / REJECT
// =========================

app.put("/approval/:id", async (req, res) => {

    try {

        const { aksi, user } = req.body;
        const id = req.params.id;

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"
        });

        const rows = result.data.values || [];
        const header = rows.shift();

        const index = rows.findIndex(r => r[0] == id);

        if (index == -1) {

            return res.json({
                success: false,
                message: "Data tidak ditemukan"
            });

        }

        const row = rows[index];
        const now = nowJakarta();

        if (aksi == "approve") {

            if (row[6] == "MENUNGGU_MANAGER") {

                row[6] = "MENUNGGU_OWNER";
                row[7] = user;

            } else {

                row[6] = "DISETUJUI";
                row[8] = user;
                row[9] = now;

            }

        } else {

            row[6] = "DITOLAK";

            if (!row[7]) {
                row[7] = user;
            } else {
                row[8] = user;
            }

            row[9] = now;

        }

        rows[index] = row;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [header, ...rows]
            }
        });

        // Approval Log

        const approvalResult = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "ApprovalLog!A:G"
        });

        const approvalRows = approvalResult.data.values || [];

        approvalRows.push([
            crypto.randomUUID(),
            row[0],
            row[1],
            user,
            user,
            aksi.toUpperCase(),
            now
        ]);

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: "ApprovalLog!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: approvalRows
            }
        });

        res.json({
            success: true,
            message: aksi == "approve"
                ? "Pengajuan berhasil disetujui"
                : "Pengajuan berhasil ditolak"
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: err.message
        });

    }

});

// =========================
// APPROVAL OWNER
// =========================

app.get("/approval/owner", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"
        });

        const rows = result.data.values || [];
        rows.shift();

        const data = rows
            .map(r => ({
                ID: r[0],
                NO_REQUEST: r[1],
                TANGGAL: r[2],
                USER: r[3],
                TOTAL_ITEM: r[4],
                KETERANGAN: r[5],
                STATUS: r[6],
                APPROVAL1: r[7],
                APPROVAL2: r[8],
                APPROVED_AT: r[9],
                CREATED_AT: r[10]
            }))
            .filter(x => x.STATUS == "MENUNGGU_OWNER");

        res.json({
            success: true,
            data
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false,
            message: err.message
        });

    }

});

// =========================
// APPROVAL ALL
// =========================

app.get("/approval/all", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Pengajuan!A:L"

        });

        const rows = result.data.values || [];

        rows.shift();

        const data = rows.map(r => ({

            ID: r[0],
            NO_REQUEST: r[1],
            TANGGAL: r[2],
            USER: r[3],
            TOTAL_ITEM: r[4],
            KETERANGAN: r[5],
            STATUS: r[6],
            APPROVAL1: r[7],
            APPROVAL2: r[8],
            APPROVED_AT: r[9],
            CREATED_AT: r[10]

        }));

        res.json({

            success: true,
            data

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =========================
// GET USERS
// =========================

app.get("/users", async (req, res) => {

    try {

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Users!A:G"

        });

        const rows = result.data.values || [];

        rows.shift();

        const data = rows.map(r => ({

            ID: r[0],
            NAMA: r[1],
            USERNAME: r[2],
            ROLE: r[4],
            STATUS: r[5],
            CREATED_AT: r[6]

        }));

        res.json({

            success: true,
            data

        });

    } catch (err) {

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =========================
// TAMBAH USER
// =========================

app.post("/users", async (req, res) => {

    try {

        const {

            nama,
            username,
            password,
            role,
            status

        } = req.body;

        const hash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        await sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: "Users!A:G",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [[

                    crypto.randomUUID(),
                    nama,
                    username,
                    hash,
                    role,
                    status || "ACTIVE",
                    nowJakarta()

                ]]

            }

        });

        await saveActivity(

            nama,
            "TAMBAH USER",
            username

        );

        res.json({

            success: true,
            message: "User berhasil ditambahkan"

        });

    } catch (err) {

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =========================
// UPDATE USER
// =========================

app.put("/users/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const {

            nama,
            username,
            password,
            role,
            status

        } = req.body;

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Users!A:G"

        });

        const rows = result.data.values || [];

        const header = rows.shift();

        const index = rows.findIndex(r => r[0] == id);

        if (index == -1) {

            return res.json({

                success: false,
                message: "User tidak ditemukan"

            });

        }

        let hash = rows[index][3];

        if (password) {

            hash = crypto
                .createHash("sha256")
                .update(password)
                .digest("hex");

        }

        rows[index] = [

            id,
            nama,
            username,
            hash,
            role,
            status,
            rows[index][6]

        ];

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "Users!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [

                    header,
                    ...rows

                ]

            }

        });

        res.json({

            success: true,
            message: "User berhasil diupdate"

        });

    } catch (err) {

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =========================
// DELETE USER
// =========================

app.delete("/users/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const result = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: "Users!A:G"

        });

        const rows = result.data.values || [];

        const header = rows.shift();

        const data = rows.filter(r => r[0] != id);

        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: "Users!A1",

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [

                    header,
                    ...data

                ]

            }

        });

        res.json({

            success: true,
            message: "User berhasil dihapus"

        });

    } catch (err) {

        res.json({

            success: false,
            message: err.message

        });

    }

});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
