"use strict"

//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import facts from "./facts.json";
import { count } from "console";
import { ElementFlags } from "typescript";

//B. configurazioni
const port: number = 1337;
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa -> const app: express.Express = express();

const icon_url = "https://assets.chucknorris.host/img/avatar/chuck-norris.png";
const api_url = "https://api.chucknorris.io"


const categories = []
//const categories = ["career","money","explicit","history","celebrity","dev","fashion","food","movie","music","political","religion","science","sport","animal","travel"]
const base64Chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"]


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
app.get("/api/categories", function(req, res, next){
    const categories: string[] = [];

    if(facts)
    {
        for (const fact of facts.facts) {
            for (const category of fact.categories) 
            {
                if(!categories.includes(category))
                    categories.push(category);
            }
        }

        if(categories.length > 0)
            res.send(categories);
        else
            res.status(404).send("nessuna categoria trovata");
    }
    else
        res.status(404).send("file facts non trovato");
});

app.get("/api/facts", function(req, res, next){
    const category = req.query.category?.toString();

    if(category)
    {
        const categoryFacts = facts.facts.filter(fact => fact.categories.includes(category))
    
        categoryFacts.sort(function(a, b){
            return b.score - a.score;
        })
        
        res.send(categoryFacts);
    }
    else
        res.status(400).send("Parametro categoria mancante");
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


function SalvaSuDisco(res: express.Response, data: Array<JSON>)
{
    fs.writeFile("./radios.json", JSON.stringify(data), function(err){
        if(!err)
            return;
        else
            res.status(500).send("Errore interno del server (aggiornamento db fallito)");
    });
}


