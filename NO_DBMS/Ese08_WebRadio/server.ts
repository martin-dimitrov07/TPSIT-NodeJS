//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import states from "./states.json";
import radios from "./radios.json";
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
app.get("/api/elenco", function(req, res, next){
    if(states)
        res.send(states);
    else
        res.status(404).send("Regioni non trovate");
})

app.post("/api/radios", function(req, res, next){
    const region = req.body.region;

    if(region)
    {
        if(region != "tutti")
        {
            const regionRadios = radios.filter(radio => radio.state == region);

            if(regionRadios)
                res.send(regionRadios);
            else
                res.status(404).send("radio non trovate");
        }
        else
            res.send(radios);
    }
    else
        res.status(404).send("Paramentro regione mangiante");
})

app.patch("/api/like", function(req, res, next){
    const idRadio = req.body.id;

    if(idRadio)
    {
        const radio = radios.find(radio => radio.id == idRadio);

        if(radio)
            radio.votes = (parseInt(radio.votes) + 1).toString();

        SalvaSuDisco(res);
        res.send({"ris": "ok"});
    }
    else
        res.status(404).send("Paramentro regione mangiante");
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
    fs.writeFile("./radios.json", JSON.stringify(radios), function(err){
        if(!err)
            return;
        else
            res.status(500).send("Errore interno del server (aggiornamento db fallito)");
    });
}