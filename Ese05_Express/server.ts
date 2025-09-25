// Importiamo le librerie http/url/fs (file system)
// Consente di gestire le richieste HTTP
import http from "http";
// Consente di gestire gli url/indirizzi
import url from "url";
// Consente di accedere al file system
// javascript non accede al file system ma noi stiamo facendo un server quindi lato server si può accedere al file system
import fs from "fs";

const port:number = 1337;
