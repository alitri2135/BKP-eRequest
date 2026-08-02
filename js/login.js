async function login(){

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if(username === "" || password === ""){

        Swal.fire(
            "Error",
            "Username dan Password wajib diisi",
            "error"
        );

        return;
    }

    try{

        const res = await api("login", {
            username,
            password
        });

        if(res.success === false){
            return;
        }

        localStorage.setItem("user", JSON.stringify(res.user));

        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("app").style.display = "flex";

        document.getElementById("username").innerHTML = res.user.nama;

        applyRoleMenu();

        switch(res.user.role){

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

            default:
                loadPage("dashboard");
        }

    }catch(err){

        Swal.fire(
            "Error",
            "Tidak dapat terhubung ke server",
            "error"
        );

        console.error(err);

    }

}