const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());

app.use(
    express.static(
        __dirname + "/public"
    )
);

let orderId = 1;

let orders = [];

app.post(
    "/new-order",
    (req, res) => {

        const order = {
            id: orderId++,
            player:
                req.body.player,
            from:
                req.body.from,
            to:
                req.body.to,
            comment:
                req.body.comment || "",
            acceptedBy: null,
            createdAt:
                Date.now()
        };

        orders.push(order);

        io.emit(
            "newOrder",
            order
        );

        res.json({
            success: true
        });

    }
);

app.post(
    "/accept-order",
    (req, res) => {

        const {
            id,
            driver
        } = req.body;

        const order =
            orders.find(
                o => o.id == id
            );

        if (!order) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Заказ не найден"
                });

        }

        if (
            order.acceptedBy
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Заказ уже принят"
                });

        }

        order.acceptedBy =
            driver;

        io.emit(
            "orderAccepted",
            order
        );

        res.json({
            success: true
        });

    }
);

app.get(
    "/orders",
    (req, res) => {

        res.json(
            orders
        );

    }
);

io.on(
    "connection",
    socket => {

        console.log(
            "🔌 Подключился клиент:",
            socket.id
        );

        socket.on(
            "disconnect",
            () => {

                console.log(
                    "❌ Отключился:",
                    socket.id
                );

            }
        );

    }
);

const PORT =
    process.env.PORT ||
    3000;

server.listen(
    PORT,
    () => {

        console.log(
            `🚕 Server started on port ${PORT}`
        );

    }
);
