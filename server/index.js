import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.static('./public'));
app.get('/', (req, res) => {
    res.send('Home');
});

server.listen(3001, () => {
  console.log("Server running on port: 3001");
});

io.on('connection', (socket)=>{
    console.log("User Connected: " + socket.id);

    socket.on("message",(data) =>{
        // console.log(data);
        socket.broadcast.emit('message', data);
    });
});