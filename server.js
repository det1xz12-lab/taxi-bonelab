const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Раздаём папку public
app.use(express.static(__dirname + "/public"));

let orderId = 1;

app.post("/new-order", (req, res) => {

    const order = {
        id: orderId++,
        player: req.body.player,
        from: req.body.from,
        to: req.body.to,
        comment: req.body.comment || ""
    };

    io.emit("newOrder", order);

    res.json({
        success: true
    });
});

server.listen(3000, () => {
    console.log("🚕 Server started: http://localhost:3000");
});