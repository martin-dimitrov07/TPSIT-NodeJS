//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import people from "./people.json";
import { count } from "console";
import { ElementFlags } from "typescript";

//B. configurazioni
const port: number = 1337;
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();


//C. creazione ed avvio del server HTTP
const server: http.Server = http.createServer(app);
let paginaErr = "";

//server in ascolto sulla porta 1337
server.listen(port, function(){
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function(err, content){ //content è una sequenza di byte
        if(err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    })
});

//D. middleware
//middleware 1: request log
app.use(function(req, res, next) //se si omette => come risorsa "/"
{
    console.log("Ricevuta richiesta: " + req.method + ": " + req.originalUrl);
    next(); //passa al middleware successivo
});

//middleware 2: gestione delle risorse statiche
app.use(express.static("./static"));

//middleware 3: gestione dei parametri post
app.use(express.json({"limit": "5mb"})); //i parametri post sono restituiti in req.body
//i parametri get invece sono restituiti come json in req.query

//middleware 4: log dei parametri post
app.use(function(req, res, next){
    if(req.body && Object.keys(req.body).length > 0)
        console.log("Parametri body: " + JSON.stringify(req.body));
    next();
});

//E. gestione delle root dinamiche
app.get("/api/countries", function(req, res){
    let countries: string[] = [];

    //prima soluzione tradizionale
    /*
    for(const person of people.results) 
    {
        if(!countries.includes(person.location.country))
            countries.push(person.location.country);
    }
    */

    //seconda soluzione con metodi funzionali
    const set = new Set(countries); //struttura dati che non ammette duplicati

    for(const person of people.results)
    {
        set.add(person.location.country);
    }

    //----

    countries = [...set]; //trasformo il set in array

    countries.sort(); //ordina in ordine alfabetico
    
    res.send(countries);
});

app.get("/api/getPeopleByCountry", function(req, res, next){
    let country = req.query.country;
    if(!country)
    {
        res.status(400).send("Parametro country mancante");
    }
    else
    {
        const peopleCountry = people.results.filter(person => person.location.country == country).map(person => { 
            return {
                name: { "title": person.name.title, "first": person.name.first, "last": person.name.last },
                city: person.location.city,
                state: person.location.state,
                cell: person.cell
            }
        });

        res.send(peopleCountry);
    }
});

app.get("/api/getPersonDetails", function(req, res, next){
    const name = req.query; // contiene un JSON con i parametri (non serializzato) - vale solo per GET
    if(!name)
    {
        res.status(400).send("Parametro name mancante");
    }
    else
    {
        const person = people.results.find(person => JSON.stringify(person.name) == JSON.stringify(name) );

        if(!person)
          res.status(404).send("Persona non trovata");
        else
            res.send(person);
    }
})

app.delete("/api/deletePerson", function(req, res, next){
    const name = req.body; // contiene un JSON con i parametri (non serializzato) - vale solo per POST/PUT/DELETE

    if(!name)
    {
        res.status(400).send("Parametro name mancante");
    }
    else
    {
        const indexPerson = people.results.findIndex(person => JSON.stringify(person.name) == JSON.stringify(name) );

        if(indexPerson == -1)
            res.status(404).send("Persona non trovata");
        else
        {
            people.results.splice(indexPerson, 1);
            SalvaSuDisco(res);
        }
    }
});

app.post("/api/insertPerson", function(req, res, next){
    const person = req.body;

    if(!person)
    {
        res.status(400).send("Parametro person mancante");
    }
    else
    {
        people.results.push(person);
        SalvaSuDisco(res);
    }
})

//F. default root e gestione errori
app.use(function(req, res){
    res.status(404);
    
    if(!req.originalUrl.startsWith("/api/"))
        res.send(paginaErr);
    else
        res.send("Risorsa non trovata");
});

//G. gestione errori
app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction){
    console.error("*** ERRORE ***:\n" + err.stack); //elenco completo degli errori
    res.status(500).send("Errore interno del server");
});


function SalvaSuDisco(res: express.Response)
{
    fs.writeFile("./people.json", JSON.stringify(people), function(err){
        if(!err)
            res.send({"ris": "ok"});
        else
            res.status(500).send("Errore interno del server (aggiornamento db fallito)");
    });
}