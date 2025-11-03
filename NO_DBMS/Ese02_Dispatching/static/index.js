"use strict"

btnInvia1.addEventListener("click", async function() {
    //per come è strutturato inviaRichiesta, il metodo non avdrà mai in errore perchè gli errori sono già gestiti internamente
    let response = await inviaRichiesta("GET", "/api/risorsa1", {"nome": "Pippo"});

    if(response.status == 200)
    {
        alert(JSON.stringify(response.data));
    }
    else
    {
        console.log("Errore " + response.status + ": " + response.err);
    }

})


btnInvia2.addEventListener("click", async function() {
     //per come è strutturato inviaRichiesta, il metodo non avdrà mai in errore perchè gli errori sono già gestiti internamente
    let response = await inviaRichiesta("POST", "/api/risorsa2", {"nome": "Pluto"});

    if(response.status == 200)
    {
        alert(JSON.stringify(response.data));
    }
    else
    {
        console.log("Errore " + response.status + ": " + response.err);
    }
})
	
