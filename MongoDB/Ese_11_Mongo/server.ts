//A. import delle librerie
import http from "http";
import fs from "fs";
import express from "express";
import { MongoClient } from "mongodb";  //tra {} perchè prendo solo un oggetto specifico della libreria

//B. configurazioni
const port: number = 3000; //porta di ascolto di express
const connStr = "mongodb://localhost:27017"; //porta di ascolto del DBMS
const dbName = "entities";

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
app.get("/api/unicorns", async function(req, res, next){
    const gender = req.query.gender;

    //crea un client di connessione al DB MongoDB
    const client = new MongoClient(connStr);
    //instaura la connessione ma non restituisce nulla
    await client.connect().catch(err => { 
        console.error("Errore di connessione al DBMS");
        res.status(503).send("Errore di connessione al DBMS");
        return;
    }); 

    let collection = client.db(dbName).collection("unicorns");

    let cmd = collection.find({gender}).project({_id: 0, name: 1, hair: 1, weight: 1, loves: 1}).sort({name: 1}).toArray(); //lancia la query
    // su project specifico i campi da restituire (1 per includere, 0 per escludere)
    //su sort specifico l'ordinamento (1 crescente, -1 decrescente)
    //cmd è una Promise (operazione asincrona) -> .toArray() converte i dati presi dalla Promis in un array

    cmd.catch(err => {
        res.status(500).send("Errore esecuzione query");
        return;
    });
    cmd.then(data => {
        res.send(data);
    })
    cmd.finally(() => {
        client.close(); //chiude la connessione al DBMS
    });
});

app.post("/api/addUnicorn", async function(req, res, next){
    const unicorn = req.body;

    const client = new MongoClient(connStr);

    await client.connect().catch(err => { 
        console.error("Errore di connessione al DBMS");
        res.status(503).send("Errore di connessione al DBMS");
        return;
    }); 

    let collection = client.db(dbName).collection("unicorns");

    let cmd = collection.insertOne(unicorn); //lancia la query

    cmd.catch(err => {
        res.status(500).send("Errore esecuzione query");
        return;
    });
    cmd.then(data => {
        res.send(data);
    })
    cmd.finally(() => {
        client.close(); //chiude la connessione al DBMS
    });

});

app.patch("/api/updUnicorn", async function(req, res, next){
    const name = req.body.name;
    const hair = req.body.hair;
    const loves = req.body.loves;

    const client = new MongoClient(connStr);

    await client.connect().catch(err => { 
        console.error("Errore di connessione al DBMS");
        res.status(503).send("Errore di connessione al DBMS");
        return;
    }); 

    let collection = client.db(dbName).collection("unicorns");

    //1 parametro: parametro su cui fare la ricerca, 2 parametro: $set per settare i nuovi valori
    let cmd = collection.updateOne({name}, {$set: {loves, hair}}); 

    cmd.catch(err => {
        res.status(500).send("Errore esecuzione query");
        return;
    });
    cmd.then(data => {
        res.send(data);
    })
    cmd.finally(() => {
        client.close(); //chiude la connessione al DBMS
    });
});

app.delete("/api/deleteUnicorn", async function(req, res, next){
    const name = req.body.name;

    const client = new MongoClient(connStr);

    await client.connect().catch(err => { 
        console.error("Errore di connessione al DBMS");
        res.status(503).send("Errore di connessione al DBMS");
        return;
    }); 

    let collection = client.db(dbName).collection("unicorns");

    //1 parametro: parametro su cui fare la ricerca, 2 parametro: $set per settare i nuovi valori
    let cmd = collection.deleteOne({name}); 

    cmd.catch(err => {
        res.status(500).send("Errore esecuzione query: " + err.message);
        return;
    });
    cmd.then(data => {
        res.send(data);
    })
    cmd.finally(() => {
        client.close(); //chiude la connessione al DBMS
    });
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