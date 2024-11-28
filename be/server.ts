import express from "express"
import {config} from 'dotenv';
import connect from './src/db/db';
import route from "./src/routes/index.route"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import _ from "lodash";
import * as http from "http";
import {Server} from "socket.io";
import connectSocket from "./src/services/socket";
// import { createClient } from 'redis';

// const client = createClient();

// client.on('error', err => console.log('Redis Client Error', err));

// client.connect();

config();

const hostname = 'localhost';
const port = 8080;
const fe_access = process.env.fe_access;

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [`${fe_access}`, `http://localhost:8080` ],
        credentials: true
    },
});

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
connect();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cors({
    origin: [`${fe_access}`, `http://localhost:8080` ],
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
}));

route(app)
connectSocket(io)

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
