"use strict"

window.onload = CategoriesList();

async function CategoriesList() 
{
    const response = await inviaRichiesta("GET", "/api/categories");

    if(response.status == 200)
    {
        console.log(response.data)

        categoryList.innerHTML = "choose a category: ";
        const select = document.createElement("select");
        categoryList.appendChild(select);

        for (const category of response.data) 
        {
            const opt = document.createElement("option");
            select.appendChild(opt);
            opt.textContent = category;
        }

        GetFacts(select.value);
        select.addEventListener("change", function(){ GetFacts(this.value) });
    }
    else
        alert(response.status + ": " + response.err)
}

async function GetFacts(category) 
{
    const response = await inviaRichiesta("GET", "/api/facts", { category });
    
    if(response.status == 200)
    {   
        const factsContainer = document.querySelector("#mainWrapper div");
        
        factsContainer.innerHTML = "";

        for (const fact of response.data) 
        {
            const input = document.createElement("input");
            factsContainer.appendChild(input);
            input.type = "checkbox";
            input.value = fact.id;
            
            const span = document.createElement("span");
            factsContainer.appendChild(span);
            span.textContent = fact.value;

            const br = document.createElement("br");
            factsContainer.appendChild(br);
        }
    }
    else
        alert(response.status + ": " + response.err);
}