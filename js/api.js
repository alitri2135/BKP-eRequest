const API_URL = "bkp-erequest-production.up.railway.app";

async function api(action, data = {}) {

    const response = await fetch(`${API_URL}/${action}`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    return await response.json();

}
