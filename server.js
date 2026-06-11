const express = require("express");
const http = require("http");
const fs = require("fs");
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

const ORDERS_FILE =
    "./orders.json";

function loadOrders() {

    try {

        if (
            !fs.existsSync(
                ORDERS_FILE
            )
        ) {

            fs.writeFileSync(
                ORDERS_FILE,
                "[]"
            );

        }

        return JSON.parse(
            fs.readFileSync(
                ORDERS_FILE,
                "utf8"
            )
        );

    } catch {

        return [];

    }

}

function saveOrders() {

    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(
            orders,
            null,
            2
        )
    );

}

let orders =
    loadOrders();

let orderId = 1;

if (
    orders.length > 0
) {

    orderId =
        Math.max(
            ...orders.map(
                o => o.id
            )
        ) + 1;

}

app.post(
    "/new-order",
    (req, res) => {

        const order = {

            id:
                orderId++,

            player:
                req.body.player,

            from:
                req.body.from,

            to:
                req.body.to,

            comment:
                req.body.comment ||
                "",

            acceptedBy:
                null,

            status:
                "free",

            createdAt:
                Date.now()

        };

        orders.push(
            order
        );

        saveOrders();

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

        if (
            !order
        ) {

            return res
                .status(404)
                .json({
                    success: false
                });

        }

        if (
            order.status !==
            "free"
        ) {

            return res
                .status(400)
                .json({
                    success: false
                });

        }

        order.acceptedBy =
            driver;

        order.status =
            "working";

        saveOrders();

        io.emit(
            "orderAccepted",
            order
        );

        res.json({
            success: true
        });

    }
);

app.post(
    "/complete-order",
    (req, res) => {

        const {
            id
        } = req.body;

        const order =
            orders.find(
                o => o.id == id
            );

        if (
            !order
        ) {

            return res
                .status(404)
                .json({
                    success: false
                });

        }

        orders =
            orders.filter(
                o => o.id != id
            );

        saveOrders();

        io.emit(
            "orderCompleted",
            {
                id
            }
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
            "🔌 Подключился:",
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
