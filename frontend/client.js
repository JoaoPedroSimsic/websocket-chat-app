"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
var Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZW1haWwiLCJpYXQiOjE3NDUyNzM4NzgsImV4cCI6MTc0NTg3ODY3OH0.KtxTYZvfiU62eg9QDYkfFWCBd-fEGqe6GAf4WWmE0yw';
var socket = (0, socket_io_client_1.io)('ws://localhost:3000', {
    auth: {
        token: Token,
    },
});
socket.on('connect', function () {
    console.log('Connected to websocket server');
    console.log('Socket ID: ', socket.id);
});
socket.on('disconnect', function (reason) {
    console.log('Disconnected from websocket: ', reason);
});
socket.on('connect_error', function (err) {
    console.error('WebSocket connection error:', err.message);
});
// Generic listener for any incoming events (useful for debugging)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
socket.onAny(function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    console.log("Received event: ".concat(event), args);
});
socket.on('chat:message', function (message) {
    console.log('New chat message:', message);
});
// You can also add listeners for error events you might emit from the server
socket.on('error:room:join', function (errorMessage) {
    console.error('Error joining room:', errorMessage);
});
socket.on('error:chat:message', function (errorMessage) {
    console.error('Error sending message:', errorMessage);
});
