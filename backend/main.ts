import express from "express";
import { Server } from "socket.io";
import * as http from "http";

import { ReadlineParser, SerialPort } from "serialport";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

server.listen(9090, () => { console.log("listening on :9090") });

io.on("connection", (socket) => {
    socket.onAny((event, data) => {
        console.log({ event, data })
        socket.broadcast.emit(event, data);
    });
})

const serialPort = new SerialPort({ baudRate: 9600, path: "COM1" });
const serialParser = new ReadlineParser({ delimiter: "\n" });

// serialPort.on("")
serialParser.on("data", (data: string) => {
    try {
        console.log("got data", data);
        io.emit("hardware",JSON.parse(data));
    } catch (error) {
        console.error(error);
    }
})