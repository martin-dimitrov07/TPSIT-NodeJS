//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import circuiti from "./circuiti.json";
import piloti from "./piloti.json";
import { count } from "console";
import { ElementFlags } from "typescript";
import e from "express";

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
app.get("/api/circuiti", function(req, res, next){
    if(circuiti)
    {
        res.send(circuiti);
    }
    else
        res.status(500).send("Errore interno del server (lettura db fallita)");
});

app.get("/api/piloti", function(req, res, next)
{
    const race = req.query.race;

    if(race)
    {
        const circuito = circuiti.find(c => c.race == race);

        if(circuito)
        {
            const pilotiRace = [];
            const scuderie = [];

            if(circuito.results && circuito.results.length > 0)
            {
                for (const numero of circuito.results)
                {
                    for(const scuderia of piloti)
                    {
                        for(const pilota of scuderia.piloti)
                        {
                            if(pilota.numero == numero)
                            {
                                pilotiRace.push(pilota);
                                scuderie.push(scuderia.scuderia);
                            }    
                        }
                    }
                }

                res.send({ scuderie: scuderie, piloti: pilotiRace });
            }
            else
                res.send({ message: "vuoto" }); 
        }
        else
            res.status(404).send("Risorsa non trovata (circuito inesistente)");
    }
    else
        res.status(400).send("Richiesta non valida (manca il parametro race)");
});

app.patch("/api/aggiornaRisultati", function(req, res, next)
{
    const race = req.body.globalRace;

    const punti: any = [25,18,15,12,10,8,6,4,2,1];
    let pos = 0;

    if(race)
    {
        const circuito = circuiti.find(c => c.race == race);

        if(circuito)
        {
            if(circuito.results && circuito.results.length > 0)
            {
                for (const numero of circuito.results)
                {
                    for(const scuderia of piloti)
                    {
                        for(const pilota of scuderia.piloti)
                        {
                            if(pilota.numero == numero && pos < 10)
                            {
                                pilota.punti += punti[pos++];
                            }    
                        }
                    }
                }
                SalvaSuDisco(res);
                res.send({ message: "ok" });
            }
            else
                res.send({ message: "vuoto" });
        }
    }
    else
        res.status(400).send("Richiesta non valida (manca il parametro race)");
});

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
    fs.writeFile("./piloti.json", JSON.stringify(piloti), function(err){
        if(!err)
            return;
        else
            res.status(500).send("Errore interno del server (aggiornamento db fallito)");
    });
}