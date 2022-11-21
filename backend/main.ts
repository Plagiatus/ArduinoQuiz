import express from "express";
import { Server } from "socket.io";
import * as http from "http";
import { networkInterfaces } from "os";

import { ReadlineParser, SerialPort } from "serialport";
import { argv } from "process";

const app = express();
app.use(express.static("../frontend/dist/"));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

server.listen(9090, () => { displayConnectionIPs(); });

io.on("connection", (socket) => {
	socket.onAny((event, data) => {
		console.log({ event, data })
		socket.broadcast.emit(event, data);
	});
})

setupArduinoCommunication();
function setupArduinoCommunication() {
	if (!argv[2]) {
		console.warn("  \x1b[30m\x1b[43m WARNING: \x1b[0m No parameter found for arduino path. No connection established.");
		return;
	}
	const serialPort = new SerialPort({ baudRate: 9600, path: argv[2] });
	const serialParser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

	serialPort.on("open", () => {
		console.log("Arduino communication opened.");
	})
	serialParser.on("data", (data: string) => {
		try {
			console.log("got data", data);
			io.emit("hardware", JSON.parse(data));
		} catch (error) {
			console.error(error);
		}
	})
}

function displayConnectionIPs() {
	console.log("\x1b[42m\x1b[37m%s\x1b[0m", "\n Connect through ");
	const results = {} as any;
	const nets = networkInterfaces();
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