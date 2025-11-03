"use strict"

let globalRace = "";

window.onload = function() {
    ElencoCircuiti();

    document.querySelectorAll(".row")[1].style.display = "none";
    document.querySelectorAll(".row")[2].style.display = "none";
};

async function ElencoCircuiti() {
    const response = await inviaRichiesta("GET", "/api/circuiti");

    if(response.status === 200) 
    {
        const tbodyCircuiti = document.querySelector("tbody");
        tbodyCircuiti.innerHTML = "";
        
        let id = 1;

        for(const circuito of response.data)
        {
            const tr = document.createElement("tr");
            tbodyCircuiti.appendChild(tr);
            tr.addEventListener("click", () => { ElencoPiloti(circuito.race, circuito.saved); })

            let td = document.createElement("td");
            tr.appendChild(td);
            td.style.fontWeight = "bold";
            td.textContent = id++;

            td = document.createElement("td");
            tr.appendChild(td);
            const img = document.createElement("img");
            img.src = `https://flagcdn.com/w80/${circuito.countryCode.toLowerCase()}.png`;
            img.title = circuito.country;
            img.style.width = "30px";
            td.appendChild(img);

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = circuito.race;

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = circuito.circuit;

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = circuito.location;
        }
    }
    else
        alert(response.status + ": " + response.err);
}

async function ElencoPiloti(race, saved)
{
    const response = await inviaRichiesta("GET", "/api/piloti", { race }); 
    
    globalRace = race;

    if(response.status === 200)
    {
        document.querySelectorAll(".row")[1].style.display = "";

        if(response.data.message && response.data.message == "vuoto")
        {
            document.querySelectorAll(".row .col-sm-12")[1].textContent = "Risultati non disponibili per il Gran Premio di " + race;
            document.querySelectorAll(".row")[2].style.display = "none";
        }
        else
        {
            document.querySelectorAll(".row")[2].style.display = "";

            document.querySelector(".btn").disabled = saved;            
            const tbodyPiloti = document.querySelectorAll("tbody")[1];
            tbodyPiloti.innerHTML = "";
            
            let pos = 0;

            document.querySelectorAll(".row .col-sm-12")[1].textContent = "Risultati del Gran Premio di " + race;

            for(const pilota of response.data.piloti)
            {
                tbodyPiloti.innerHTML += `				
                    <tr>
                            <td rowspan="3"> ${pos+1} </td>
                            <td rowspan="3">
                            <img src="./img/${pilota.nome.replace(" ", "-")}.jpg">
                            </td>
                            <td>${pilota.numero}</td>
                    </tr>
                    <tr> <td>${pilota.nome}</td> </tr>
                    <tr> <td>${response.data.scuderie[pos]}</td> </tr>
                `;

                pos++;
            }
        }
    }
    else
        alert(response.status + ": " + response.err);
}

document.querySelector(".btn").addEventListener("click", async function() {
    const response = await inviaRichiesta("PATCH", "/api/aggiornaRisultati", { globalRace });

    if(response.status === 200)
    {
        if(response.data.message == "ok")
            alert("Risultati aggiornati con successo");
    }
    else
        alert(response.status + ": " + response.err);
})