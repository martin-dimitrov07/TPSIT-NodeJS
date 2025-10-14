"use strict"

window.onload = ElencoRegioni();

async function ElencoRegioni() 
{
    const response = await inviaRichiesta("GET", "/api/elenco");
    
    if(response.status == 200)
    {
        //<option value="tutti"> tutti </option>

        for (const region of response.data) 
        {
            const opt = document.createElement("option");  
            lstRegioni.appendChild(opt);

            opt.textContent = `${region.name} [${region.stationcount} emittenti]`;
            opt.value = region.value;
        }

        ElencoRadios();
    }
    else
        alert(response.status + ": " + response.err);
}

lstRegioni.addEventListener("change", function(){ ElencoRadios(this.value) });

async function ElencoRadios(region = "tutti"){
    const response = await inviaRichiesta("POST", "/api/radios", { region });

    if(response.status = 200)
    {
        tbody.innerHTML = "";

        for (const radio of response.data)
        {
            const tr = document.createElement("tr");
            tbody.appendChild(tr);  
            
            let td = document.createElement("td");
            tr.appendChild(td);
            let img = document.createElement("img");
            td.appendChild(img);
            img.src = radio.favicon;
            img.width = 40;

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = radio.name;

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = radio.codec;

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = radio.bitrate;

            td = document.createElement("td");
            tr.appendChild(td);
            td.textContent = radio.votes;

            td = document.createElement("td");
            tr.appendChild(td);
            img = document.createElement("img");
            td.appendChild(img);
            img.src = "/like.jpg";
            img.width = 40;
            td.style.cursor = "poiter";
            td.addEventListener("click", () => { LikeRadio(radio.id) });
        }
    }
    else
        alert(response.status + ": " + response.err);
}

async function LikeRadio(id) 
{
    const response = await inviaRichiesta("PATCH", "/api/like", { id });
    
    if(response.status == 200)
    {
        alert("like aggiunto correttamente");
        ElencoRadios(lstRegioni.value);
    }
    else
        alert(response.status + ":" + response.err);
}

