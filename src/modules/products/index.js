const {
  getProducts,
  createProduct,
  updateProduct,
  getProductById,
  reviewProduct,
  getMVPProduct,
} = require("./controller");

function products({ server, sub }) {
  server.get(`${sub}`, getProducts);
  server.get(`${sub}/mvp`, getMVPProduct);
  server.get(`${sub}/:id`, getProductById);
  server.post(`${sub}/create`, createProduct);
  server.put(`${sub}/update/:id`, updateProduct);
  server.post(`${sub}/review/:id`, reviewProduct);
}

module.exports = products;
