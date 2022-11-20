import express from "express";
import { Server } from "socket.io";
import * as http from "http";

import { ReadlineParser, SerialPort } from "serialport";
import { argv } from "process";

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

setupArduinoCommunication();
function setupArduinoCommunication() {
	if (!argv[2]) {
		console.warn("\x1b[30m\x1b[43m%s\x1b[0m", "  WARNING: No parameter found for arduino path. No connection established.");
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