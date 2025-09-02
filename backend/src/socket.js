import { Server } from 'socket.io';


let io;
export const getIo = () => io;


export function initSocket(httpServer) {
io = new Server(httpServer, {
cors: { origin: process.env.CLIENT_ORIGIN, credentials: true }
});


const kitchen = io.of('/kitchen');
const staff = io.of('/staff');
const customer = io.of('/customer');


kitchen.on('connection', (socket) => {
console.log('Kitchen connected', socket.id);
});


staff.on('connection', (socket) => {
console.log('Staff connected', socket.id);
});


customer.on('connection', (socket) => {
console.log('Customer connected', socket.id);
});
}