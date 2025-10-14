import fs from "fs";
import radios from "./radios.json";
import states from "./states.json";

for (const state of states)
{
    const stateRadios = radios.filter(radio => radio.state === state.name);

    state.stationcount = stateRadios.length.toString();
}

SalvaSuDisco();

function SalvaSuDisco()
{
    fs.writeFile("./states.json", JSON.stringify(states, null, 3), function(err){  //stringify(obj, null, 3) serve per formattare il json con 3 spazi
        if(!err)
            console.log("Aggiornamento states.json avvenuto con successo");
        else
            console.log("Errore durante l'aggiornamento di states.json");
    });
}