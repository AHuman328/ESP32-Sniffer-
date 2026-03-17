process.on('uncaughtException', (err) => {
    console.error('CRASHED:', err);
    process.exit(1);
});

const express = require('express');
const app = express();
app.use(express.json());

// Simple in-memory store (resets on redeploy — swap for a DB later)
let packets = [];

// ESP32 posts here
app.post('/packet', (req, res) => {
    const { rssi, channel, src, dest } = req.body;
    const entry = { rssi, channel, src, dest, time: new Date().toISOString() };
    packets.unshift(entry);         // newest first
    if (packets.length > 500) packets.pop(); // cap at 500
    console.log('Packet received:', entry);
    res.sendStatus(200);
});

// Website fetches this
app.get('/packets', (req, res) => {
    res.json(packets);
});

// Serve a basic dashboard
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
