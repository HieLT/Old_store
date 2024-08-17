import express from "express"
import {config} from 'dotenv';
import connect from './src/db/db';
import route from "./src/routes/index.route"
import bodyParser from "body-parser";

config();
const hostname = 'localhost';
const port = 8080;
const app = express()

connect();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
route(app)
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
