// Importiamo le librerie http/url/fs (file system)
// Consente di gestire le richieste HTTP
import http from "http";
// Consente di gestire gli url/indirizzi
import url from "url";
// Consente di accedere al file system
// javascript non accede al file system ma noi stiamo facendo un server quindi lato server si può accedere al file system
import fs from "fs";
import headers from "./headers.json";

const port:number = 1337;

const server:http.Server = http.createServer(function (req:http.IncomingMessage, res:http.ServerResponse) {
    console.log("Richiesta ricevuta: " + req.url)

    // Contiene il metodo della richiesta
    const metodo:string = req.method!; // il ! indica che siamo sicuri che esiste (non è undefined)
    // non si può usare il ! nelle dichiarazioni con const e let
    // const metodo: string | undefined = req.method;
    // Restituisce la url della richiesta sotto forma di json (path sotto forma di json)
    const path:any = url.parse(req.url!, true);



    // Risorsa richiesta al server dal client
    const risorsa:string = path.pathname;
    // Parametri richiesti al server dal client
    const param:any = path.query;
    const domminio:string = req.headers.host!;

    // bisogna fare json.stringify di param perchè param è un json
    console.log("Metodo: " + metodo + "\nRisorsa: " + risorsa, "\nParams: " + JSON.stringify(param), "\nDominio: " + domminio);
    
    // Bisogna scriverla con lo / perche le risorse van sempre scritte con lo / davanti
    if (risorsa == "/favicon.ico")
    {
        // Se la risorsa è favicon.ico vado a leggerla dentro il file system e la restituisco al client
        let favicon:NonSharedBuffer = fs.readFileSync("./favicon.ico");

        // Scrive nell'head della risposta il codice 200 quindi andato a buon fine
        // e andiamo a drigli che è un icona andando a prendere ciò che si deve scrivere dentro a headers
        res.writeHead(200, headers.ico);
        // scriviamo nella risposta alla richiesta l'icon favicon
        res.write(favicon);

    }
    else
    {
        // Gli mandiamo una pagina html costruita dinamicamente
        res.writeHead(200, headers.html);
        res.write("<h1> Informazioni relative alla richiesta ricevuta </h1>");
        res.write("<p> Metodo: " + metodo + "</p>");
        res.write("<p> Risorsa: " + risorsa + "</p>");
        res.write("<p> Parametri: " + JSON.stringify(param) + "</p>");
        res.write("<p> Dominio: " + domminio + "</p>");
    }

    // La risposta del server alla richiesta ricevuta dal client (può essere fatto una sola volta)
    res.end();
});

server.listen(port, function () {
    console.log("Server in ascolto sulla porta " + port);
});

