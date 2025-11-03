"use strict";

// Importiamo le librerie http/url/fs (file system)
// COnsente di gestire le richieste HTTP
const http = require("http");
// Consente di gestire gli url/indirizzi
const url = require("url");
// Consente di accedere al file system
// javascript non accede al file system ma noi stiamo facendo un server quindi lato server si può accedere al file system
const fs = require("fs");

const headers = require("./headers.json");

const port = 1337;

const server = http.createServer(function(req, res){
    console.log("Richiesta ricevuta: " + req.url)

    // Contiene il metodo della richiesta
    const metodo = req.method;
    // Restituisce la url della richiesta sotto forma di json (path sotto forma di json)
    const path = url.parse(req.url, true); //true => parsifica anche i parametri


    // Risorsa richiesta al server dal client
    const risorsa = path.pathname;
    // Parametri richiesti al server dal client (in JSON)
    const param = path.query;

    const domminio = req.headers.host;

    console.log("Metodo:" + metodo, "Risorsa: " + risorsa, "Params: " + JSON.stringify(param), "Dominio: " + domminio);

    if(risorsa == "/favicon.ico")
    {
        let favicon = fs.readFileSync("./favicon.ico"); //lettura sincrona del file
        res.writeHead(200, headers.ico);
        res.write(favicon); //si può fare più volte
    }
    else
    {
        res.writeHead(200, headers.html);
        res.write("<h1>Risorsa richiesta: " + risorsa + "</h1>");
        res.write("<h2>Metodo: " + metodo + "</h2>");
        res.write("<h3>Parametri: " + JSON.stringify(param) + "</h3>");
        res.write("<h3>Dominio: " + domminio + "</h3>");
    }

    res.end(); //si può fare una volta sola (nello stesso flusso)

    // La risposta del server alla richiesta ricevuta dal client
    // res.end("ok");
});

server.listen(port, function(){
    console.log("Server in ascolto sulla porta " + port);
});

