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
    res.send('Join');
});
//party code - if any
let generatedCode = null;

server.listen(3001, () => {
  console.log("Server running on port: 3001");
});

io.on('connection', (socket)=>{
    console.log("User Connected: " + socket.id);
    if (!generatedCode) {
        generatedCode = Math.random().toString(36).substr(2, 6).toUpperCase(); 
        //generates only for the user connected
        socket.emit('code', { code: generatedCode });
    }
    socket.on("checkCode", (data) => {
        if (data === generatedCode) {
            io.emit('userJoined', `User ${socket.id} has joined the party with code: ${generatedCode}`);
            console.log(`A user has joined the party with code: ${generatedCode}`);
        } else {
            console.log("Invalid code entered.");
        }
    });
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} is being disconnected`);
        socket.disconnect();
    });
});