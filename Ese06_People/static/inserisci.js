"use strict";

// i seguenti puntatori sono tutti definiti tramite ID
// let btnSalva  
// let btnAnnulla  
// let lstCountries  

getCountries();

async function getCountries(){
    let response = await inviaRichiesta("GET", "/api/countries");

    if(response.status == 200)
    {
        const countries = response.data;
        console.log(countries);

        for (const country of countries) 
        {
            const opt = document.createElement("option");   
            opt.textContent = country;
            lstCountries.appendChild(opt);
        }

        lstCountries.selectedIndex = -1;
    }
    else
    {
        console.error("Error", response.err);
        alert(response.status + ": " + response.err);
    }
}

btnAnnulla.addEventListener("click", function(){
    window.location.href = "/";
});

btnSalva.addEventListener("click", async function(){
    if(lstCountries.selectedIndex == -1)
    {
        alert("Selezionare un paese");
        return;
    }
    else
    {
        const person = {
            "name": {
                "title": txtTitle.value,
                "first": txtFirst.value,
                "last": txtLast.value
            },
            "gender": document.querySelector("input[name='gender']:checked").value,
            "location": {
                "country": lstCountries.value,
                "city": txtCity.value,
                "state": txtState.value
            },
            "cell": txtCell.value,
            "email": txtMail.value,
            "dob": "unknown"
        }

        const response = await inviaRichiesta("POST", "/api/insertPerson", person);

        if(response.status == 200)
        {
            console.log(response.data);
            alert("persona inserita correttamente")   
            
            window.location.href = "/";
        }
        else
            alert(response.status + ": " + response.err);

    }
});