import express from "express"
import {config} from 'dotenv';
import connect from './src/db/db';
import route from "./src/routes/index.route"
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";

config();

const fe_access = process.env.fe_access;

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
    origin: [`${fe_access}`],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));

route(app)
app.listen(() => {
    console.log(`Server running at ${fe_access}`);
});
