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
const serialport_1 = require("serialport");
const process_1 = require("process");
const app = (0, express_1.default)();
const server = http.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
server.listen(9090, () => { console.log("listening on :9090"); });
io.on("connection", (socket) => {
    socket.onAny((event, data) => {
        console.log({ event, data });
        socket.broadcast.emit(event, data);
    });
});
setupArduinoCommunication();
function setupArduinoCommunication() {
    if (!process_1.argv[2]) {
        console.warn("\x1b[30m\x1b[43m%s\x1b[0m", "  WARNING: No parameter found for arduino path. No connection established.");
        return;
    }
    const serialPort = new serialport_1.SerialPort({ baudRate: 9600, path: process_1.argv[2] });
    const serialParser = serialPort.pipe(new serialport_1.ReadlineParser({ delimiter: "\n" }));
    serialPort.on("open", () => {
        console.log("Arduino communication opened.");
    });
    serialParser.on("data", (data) => {
        try {
            console.log("got data", data);
            io.emit("hardware", JSON.parse(data));
        }
        catch (error) {
            console.error(error);
        }
    });
}
