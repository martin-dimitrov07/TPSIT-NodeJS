"use strict"

window.onload = ElencoNews();

async function ElencoNews()
{
    const response = await inviaRichiesta("GET", "/api/elenco");

    if(response.status == 200)
    {
        wrapper.innerHTML = "";
        
        for (const notizia of response.data) 
        {
            wrapper.innerHTML += `
            <span class="titolo"> ${notizia.titolo}</span>
            <a href ='#' onclick=LeggiNotizia("${notizia.file}")> Leggi </a>
            <span class='nVis'> visualizzato ${notizia.visualizzazioni} volte </span>
            <br>  `;
        }
    }
    else
    {
        alert("Error " + response.status + ": " + response.err);
    }
}

async function LeggiNotizia(file, id) 
{
    const response = await inviaRichiesta("POST", "/api/dettagli", { file });
    
    if(response.status == 200)
    {
        news.innerHTML = response.data.file;

        //console.log(parseInt(document.querySelector(".nVis" + id).textContent.substring(14)))

        ElencoNews();
    }
    else
    {
        alert("Error " + response.status + ": " + response.err);
    }
}