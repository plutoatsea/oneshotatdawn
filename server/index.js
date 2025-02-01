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

//tracks users and party name codes
let parties = [];

server.listen(3001, () => {
  console.log("Server running on port: 3001");
});

io.on('connection', (socket) => {
    console.log("User Connected: " + socket.id);

    //create new party handler
    socket.on('createParty', () => {
        //generate 6 digit code - like kahoot
        const partyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        const newParty = {
            code: partyCode,
            users: [socket.id]
        };
        //store parties
        parties.push(newParty);
        console.log(parties); /////log
        //send party code to creator
        socket.emit('partyCreated', { code: partyCode });
        console.log(`New party created with code: ${partyCode}`);
    });

    //join party
    socket.on('joinParty', (data) => {
        const { partyCode } = data;
        const party = parties.find(party => party.code === partyCode);
        if (party) {
            let userCount = parties.reduce((count, party) => count + party.users.filter(userId => userId === socket.id).length, 0);
            if(userCount<1){
                //Add the user to the party's users array
                party.users.push(socket.id);
                //Notify all users in the party
                io.to(party.users).emit('userJoined', `User ${socket.id} has joined the party with code: ${partyCode}`);
                console.log(parties);/////////////log
                console.log(`User ${socket.id} joined party with code: ${partyCode}`);
            }
        } else {
            // If the party code is not valid
            socket.emit('invalidCode', 'Invalid party code. Please try again!');
            console.log("Invalid party code entered.");
        }
    });
    //disconnect handler
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} is being disconnected`);
        //Remove the user from all parties they are in
        parties.forEach(party => {
            const index = party.users.indexOf(socket.id);
            if (index !== -1) {
                //remove user from party
                party.users.splice(index, 1);
                //notify party users that someone left
                io.to(party.users).emit('userLeft', `User ${socket.id} has left the party`);
            }
        });

        socket.disconnect();
    });
});