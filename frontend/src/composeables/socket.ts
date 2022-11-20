import {io} from "socket.io-client";

const socket = io(`${window.location.protocol}//${window.location.hostname}:9090`);

export function socketSendMessage(event: string, data: any){
    socket.emit(event, data);
}

export function socketListen(event: string, callback: (...args: any[]) => void){
    socket.on(event, callback);
}