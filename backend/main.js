"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http = __importStar(require("http"));
const os_1 = require("os");
const serialport_1 = require("serialport");
const process_1 = require("process");
const app = (0, express_1.default)();
app.use(express_1.default.static("../frontend/dist/"));
const server = http.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
server.listen(9090, () => { displayConnectionIPs(); });
io.on("connection", (socket) => {
    socket.onAny((event, data) => {
        console.log({ event, data });
        socket.broadcast.emit(event, data);
    });
});
setupArduinoCommunication();
function setupArduinoCommunication() {
    if (!process_1.argv[2]) {
        console.warn("  \x1b[30m\x1b[43m WARNING: \x1b[0m No parameter found for arduino path. No connection established.");
        return;
    }
    const serialPort = new serialport_1.SerialPort({ baudRate: 9600, path: process_1.argv[2] });
    const serialParser = serialPort.pipe(new serialport_1.ReadlineParser({ delimiter: "\n" }));
    serialPort.on("open", () => {
        console.log("Arduino communication opened.");
    });
    serialParser.on("data", (data) => {
        try {
            console.log("hardware data:", data);
            io.emit("hardware", JSON.parse(data));
        }
        catch (error) {
            console.error(error);
        }
    });
}
function displayConnectionIPs() {
    console.log("\x1b[42m\x1b[37m%s\x1b[0m", "\n Connect through ");
    const results = {};
    const nets = (0, os_1.networkInterfaces)();
    for (let name of Object.keys(nets)) {
        //@ts-expect-error
        for (let net of nets[name]) {
            //@ts-expect-error
            if ((net.family === "IPv4" || net.family === 4) /*&& !net.internal*/) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
                console.log("\x1b[32m\x1b[1m%s\x1b[0m", `  http://${net.address}:9090`);
            }
        }
    }
}
