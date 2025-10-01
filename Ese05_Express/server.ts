// Importiamo le librerie http/url/fs (file system)
// Consente di gestire le richieste HTTP
import http from "http";
// Consente di gestire gli url/indirizzi
import url from "url";
// Consente di accedere al file system
// javascript non accede al file system ma noi stiamo facendo un server quindi lato server si può accedere al file system
import fs from "fs";

import express from "express";

const port: number = 1337;
//riconosce i tipi automaticamente (non è any) -> grazie @types/node in devDependencies (sviluppo)
const app = express();
//stessa cosa
//const app: express.Express = express();
const server: http.Server = http.createServer(app);
let paginaErr = "";


server.listen(port, function(){
    console.log("Server in ascolto sulla porta " + port);

    fs.readFile("./static/error.html", function(err, content){ //content è una sequenza di byte
        if(err)
            paginaErr = "<h1>Risorsa non trovata</h1>";
        else
            paginaErr = content.toString();
    })
});