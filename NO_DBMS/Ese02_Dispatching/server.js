"use strict";

// Importiamo le librerie http/url/fs (file system)
// COnsente di gestire le richieste HTTP
const http = require("http");
// Consente di gestire gli url/indirizzi
const url = require("url");
// Consente di accedere al file system
// javascript non accede al file system ma noi stiamo facendo un server quindi lato server si può accedere al file system
const fs = require("fs");

//serve per leggere il tipo di file statico (mime type)
const mime = require("mime-types");

const headers = require("./headers.json");

const port = 1337;

let paginaErr;

const server = http.createServer(function(req, res){ //callback di createServer (funzione eseguita ogni volta che arriva una richiesta dal cliente al server)
    console.log("Richiesta ricevuta: " + req.url)

    // Contiene il metodo della richiesta
    const metodo = req.method;
    // Restituisce la url della richiesta sotto forma di json (path sotto forma di json)
    const path = url.parse(req.url, true); //true => parsifica anche i parametri


    // Risorsa richiesta al server dal client
    let risorsa = path.pathname;
    // Parametri richiesti al server dal client (in JSON) -> solo i parametri GET (accodati alla URl)
    const params = path.query;

    const domminio = req.headers.host;

    //console.log("Metodo:" + metodo, "Risorsa: " + risorsa, "Params: " + JSON.stringify(param), "Dominio: " + domminio);

    //gestione della risposta (dispatching della risorda richiesta)
    if(risorsa == "/")
    {
        risorsa = "/index.html";
    }

    if(!risorsa.startsWith("/api/"))
    {
        //gestione risorsa statici
        risorsa = "./static" + risorsa;

        fs.readFile(risorsa, function(err, content){
            if(!err)
            {
                let header = {
                    "Content-Type": mime.lookup(risorsa)
                }
                res.writeHead(200, header);
                res.write(content);
            }
            else
            {
                //console.log(err);
                res.writeHead(404, headers.html);
                res.write(paginaErr);
            }
            res.end();
        })
    }
    //gestione risorse dinamiche (API)
    else if(risorsa == "/api/risorsa1")
    {
        res.writeHead(200, headers.json);
        //in corrispondenza del 200 occorre sempre serializzare
        res.write(JSON.stringify({ "benvenuto": params.nome }));
        res.end();
    }
    else if(risorsa == "/api/risorsa2")
    {
        res.writeHead(200, headers.json);
        //in corrispondenza del 200 occorre sempre serializzare
        //in questo momento non sappiamo come leggere i parametri POST
        res.write(JSON.stringify({ "benvenuto": "pluto" }));
        res.end();
    }
    else
    {
        //in caso di errore mando un testo quindi non è il ccaso di serializzarlo
        res.writeHead(404, headers.text);
        res.write("Risorsa non trovata o non disponibile");
    }




    // else
    // {
    //     res.writeHead(200, headers.json);
    //     res.end();
    // }

    // if(risorsa == "/favicon.ico")
    // {
    //     let favicon = fs.readFileSync("./favicon.ico"); //lettura sincrona del file
    //     res.writeHead(200, headers.ico);
    //     res.write(favicon); //si può fare più volte
    // }

    // res.end(); //si può fare una volta sola (nello stesso flusso)

    // La risposta del server alla richiesta ricevuta dal client
    // res.end("ok");
});

server.listen(port, function(){
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function(err, content){ //content è una sequenza di byte
        if(err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    })
});

