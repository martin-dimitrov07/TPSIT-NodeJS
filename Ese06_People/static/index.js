"use strict"

let peopleList;  // vettore enumerativo delle Persone attualmente visualizzate
                 // comodo per gestire i pulsanti di navigazione
let currentPos;   

// i seguenti puntatori sono tutti definiti tramite ID
// let lstCountries 
// let tabStudenti  
// let divDettagli 

btnAdd.addEventListener("click", function(){
	window.location.href = "./inserisci.html";
})

divDettagli.style.display="none";
getCountries();

async function getCountries(){
    let response = await inviaRichiesta("GET", "/api/countries");

    if(response.status == 200)
    {
        const countries = response.data;
        console.log(countries);

        for (const country of countries) 
        {
            let a = document.createElement("a");   
            a.classList.add("dropdown-item");
            a.href = "#";
            a.textContent = country;
            a.addEventListener("click", function(){ getPeopleByCountry(country); dropdownMenuButton.textContent = country; });
            lstCountries.appendChild(a);
        }
    }
    else
    {
        console.error("Error", response.err);
        alert(response.status + ": " + response.err);
    }
}

async function getPeopleByCountry(country)
{
    let response = await inviaRichiesta("GET", "/api/getPeopleByCountry", {country});

    if(response.status == 200)
    {
        console.log(response.data);

        peopleList = response.data;

        tabStudenti.innerHTML = "";

        for (const person of response.data) 
        {
            let tr = document.createElement("tr");
            tabStudenti.appendChild(tr);
            
            for (const key in person) {
                let td = document.createElement("td");
                if(key == "name")
                    td.textContent = person[key].title + " " + person[key].first + " " + person[key].last;
                else
                    td.textContent = person[key];

                tr.appendChild(td);
            }

            //console.log(person.name);

            let td = document.createElement("td");
            let btn = document.createElement("button");
            btn.classList.add("btn", "btn-primary");
            btn.textContent = "Dettagli";
            btn.addEventListener("click", function(){ showDetails(person.name) });
            td.appendChild(btn);
            tr.appendChild(td);

            td = document.createElement("td");
            btn = document.createElement("button");
            btn.classList.add("btn", "btn-primary");
            btn.textContent = "Elimina";
            btn.addEventListener("click", function(){ Delete(person.name) });
            td.appendChild(btn);
            tr.appendChild(td);

        }
    }
    else
        alert(response.status + ": " + response.err);
}

async function showDetails(name)
{
    //console.log(name);
    let response = await inviaRichiesta("GET", "/api/getPersonDetails", name);

    if(response.status == 200)
    {
        console.log(response.data);

        const person = response.data;

        divDettagli.querySelector(".card-title").innerHTML = "";
        divDettagli.querySelector(".card-text").innerHTML = "";
        divDettagli.style.display = "block";

        divDettagli.querySelector(".card-img-top").src = (person.picture) ? person.picture.large : "./img/user.png";
        divDettagli.querySelector(".card-title").textContent = person.name.title + " " + person.name.first + " " + person.name.last;
        divDettagli.querySelector(".card-text").innerHTML = `
            <strong>Gender:</strong> ${person.gender} <br>
            <strong>Address:</strong> ${JSON.stringify(person.location)} <br>
            <strong>Email:</strong> ${person.email} <br>
            <strong>Dob:</strong> ${(person.dob) ? JSON.stringify(person.dob) : "unknown"} <br>
        `;

        currentPos = peopleList.findIndex(person => JSON.stringify(person.name) == JSON.stringify(name));
    }
    else
        alert(response.status + ": " + response.err);
}

async function Delete(name)
{
    if(confirm(`Sei sicuro di voler eliminare "${name.title} ${name.first} ${name.last}"?`))
    {
        let response = await inviaRichiesta("DELETE", "/api/deletePerson", name);

        if(response.status == 200)
        {
            // console.log(response.data);
            alert("Persona eliminata correttamente");
            divDettagli.style.display="none";
            getPeopleByCountry(dropdownMenuButton.textContent);
        }
        else
            alert(response.status + ": " + response.err);
    }
}


//GESTIONE PULSANTI DI NAVIGAZIONE

const btns = document.querySelectorAll("a");

btns[0].addEventListener("click", function(){ // first
    if(currentPos != 0)
    {
        currentPos = 0;
        showDetails(peopleList[currentPos].name);
    }
});

btns[1].addEventListener("click", function(){ // previous
    if(currentPos != 0)
    {
        currentPos--;
        showDetails(peopleList[currentPos].name);
    }
});

btns[2].addEventListener("click", function(){ // next
    if(currentPos != peopleList.length - 1)
    {
        currentPos++;
        showDetails(peopleList[currentPos].name);
    }
});

btns[3].addEventListener("click", function(){ // last
    if(currentPos != peopleList.length - 1)
    {
        currentPos = peopleList.length - 1;
        showDetails(peopleList[currentPos].name);
    }
});