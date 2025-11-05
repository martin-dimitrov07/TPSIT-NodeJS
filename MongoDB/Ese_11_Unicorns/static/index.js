"use strict"

const headers = ["name", "gender", "hair", "weight", "loves"]

const btnGetUnicorns = document.querySelector("button");
const btnAddUnicorn = document.querySelector(".wrapper:last-child button");
const btnUpdUnicorn = document.querySelector(".wrapper:last-child button:nth-of-type(2)");
const btnDeleteUnicorn = document.querySelector(".wrapper:last-child button:nth-of-type(3)");
const tbody = document.querySelector("tbody");

btnGetUnicorns.addEventListener("click", GetUnicorns);

async function GetUnicorns() {
    let gender = document.querySelector("input[type='radio'][name='gender']:checked").value;

    const response = await inviaRichiesta("GET", "/api/unicorns", { gender });
    // const response = await inviaRichiesta("GET", "/api/unicorns?gender=" + gender);
    // const response = await inviaRichiesta("GET", "/api/unicorns/" + gender);

    if(response.status == 200)
    {
        console.log(response.data);
        const unicorns = response.data;

        tbody.innerHTML = "";

        for (const unicorn of unicorns)
        {
            const tr = document.createElement("tr");
            tbody.appendChild(tr);

            for (const key in unicorn) 
            {
                let td = document.createElement("td");
                td.textContent = unicorn[key];;
                tr.appendChild(td);
            }
        }
    }
    else
        alert("Error " + response.status + " : " + response.err);
}

btnAddUnicorn.addEventListener("click", async () => {
    const unicorn = {
        "name": document.querySelector(".wrapper input[type='text']").value,
        "gender": document.querySelector("input[type='radio'][name='gender']:checked").value,
        "weight": 100
    }

    const response = await inviaRichiesta("POST", "/api/addUnicorn", unicorn);

    if(response.status == 200)
    {
        console.log(response.data);
        alert("Unicorno aggiunto con successo");
        GetUnicorns();
    }
    else
        alert("Error " + response.status + " : " + response.err);
});

btnUpdUnicorn.addEventListener("click", async () => {
    const name = document.querySelector(".wrapper input[type='text']").value;
    const response = await inviaRichiesta("PATCH", "/api/updUnicorn", {"loves": ["grape", "watermelon"], "hair": "brown", name});

    if (response.status == 200)
    {
        console.log(response.data);
        if(response.data.matchedCount == 0)
            alert("Nessun unicorno trovato con questo nome");
        else
        {
            alert("Unicorno aggiornato con successo");
            GetUnicorns();
        }
    }
    else
        alert("Error " + response.status + " : " + response.err);
});

btnDeleteUnicorn.addEventListener("click", async () => {
    const name = document.querySelector(".wrapper input[type='text']").value;
    const response = await inviaRichiesta("DELETE", "/api/deleteUnicorn", { name });

    if (response.status == 200)
    {
        console.log(response.data);
        if(response.data.deletedCount == 0)
            alert("Nessun unicorno trovato con questo nome");
        else
        {
            alert("Unicorno eliminato con successo");
            GetUnicorns();
        }        
    }
    else
        alert("Error " + response.status + " : " + response.err);
});