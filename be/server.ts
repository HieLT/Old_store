import express from "express"
import {config} from 'dotenv';
import connect from './src/db/db';
import route from "./src/routes/index.route"
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";

config();

const hostname = 'localhost';
const port = 8080;

const app = express()
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.use(passport.initialize());
app.use(passport.session());
connect();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cors({
    origin: [`http://${process.env.fe_hostname}:${process.env.fe_port}`],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));

route(app)
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
