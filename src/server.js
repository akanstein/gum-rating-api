const express = require("express");
const products = require("./modules/products");
const cors = require("cors");
const server = express();

server.use(
  cors({
    origin: "*",
  })
);
server.use(express.urlencoded({ extended: false }));

server.use(express.json());

server.get("/", (req, res, next) => {
  res.send({ message: "Welcome to gum rating api" });
});

products({ server: server, sub: "/products" });

module.exports = server;
