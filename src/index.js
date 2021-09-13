const connection = require("./db");
const server = require("./server");
require("dotenv").config();

connection.connect(() => {
  console.log("DB connected");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
