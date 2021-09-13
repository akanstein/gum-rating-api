const Joi = require("joi");
const connection = require("../../db");
const status = require("../../status");
const uuid = require("uuid");
const { json } = require("express/lib/response");
const products = require(".");

function getProducts(req, res) {
  connection.query("SELECT * FROM products ", (err, result) => {
    if (err)
      return res.status(status.NOT_FOUND).send({ status: false, data: err });
    if (result) {
      return res.status(status.OK).send({ status: true, data: result });
    }
  });
}

function getMVPProduct(req, res) {
  connection.execute(
    "SELECT id,name,image, (SELECT COUNT(rating) FROM reviews WHERE reviews.productId = products.id) as totalReviews, (SELECT SUM(rating) FROM reviews WHERE reviews.productId = products.id) as overallRating FROM products",
    (err, result) => {
      if (err)
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .send({ status: false, data: err });
      if (result) {
        if (!result.length)
          return res
            .status(status.NOT_FOUND)
            .send({ status: false, message: "product not found" });

        const product = result[0];
        if (product.overallRating) {
          product.overallRating = Number(
            product.overallRating / product.totalReviews
          ).toFixed(1);
        }
        connection.query(
          "SELECT * FROM reviews WHERE productId=?",
          [product.id],
          (error, result) => {
            if (error)
              return res
                .status(status.INTERNAL_SERVER_ERROR)
                .send({ status: false, error: error });
            product.reviews = result;
            return res.status(status.OK).send({ status: true, data: product });
          }
        );
      }
    }
  );
}

function getProductById(req, res) {
  const id = req.params.id;

  connection.execute(
    "SELECT id,name,image, (SELECT COUNT(rating) FROM reviews WHERE reviews.productId = products.id) as totalReviews, (SELECT SUM(rating) FROM reviews WHERE reviews.productId = products.id) as overallRating FROM products WHERE products.id=?",
    [id],
    (err, result) => {
      if (err)
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .send({ status: false, data: err });
      if (result) {
        if (!result.length)
          return res
            .status(status.NOT_FOUND)
            .send({ status: false, message: "product not found" });

        const product = result[0];
        if (product.overallRating) {
          product.overallRating = Number(
            product.overallRating / product.totalReviews
          ).toFixed(1);
        }
        connection.query(
          "SELECT * FROM reviews WHERE productId=?",
          [product.id],
          (error, result) => {
            if (error)
              return res
                .status(status.INTERNAL_SERVER_ERROR)
                .send({ status: false, error: error });
            product.reviews = result;
            return res.status(status.OK).send({ status: true, data: product });
          }
        );
      }
    }
  );
}

function createProduct(req, res) {
  const params = req.body;
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
  });

  const validateSchema = schema.validate(params);
  if (validateSchema.error) {
    return res.status(status.BAD_REQUEST).send({
      status: false,
      message: validateSchema.error.details[0].message,
    });
  }

  const { name, image } = params;
  const id = uuid.v4();

  connection.execute(
    "INSERT INTO `products` (`id`, `name`, `image`) VALUES (?,?,?)",
    [id, name, image],
    (error, result) => {
      if (error)
        return res
          .status(status.BAD_REQUEST)
          .send({ status: false, data: error });
      if (result)
        return res
          .status(status.OK)
          .send({ status: true, data: result.affectedRows });
    }
  );
}

function updateProduct(req, res) {
  const id = req.params.id;
  const params = req.body;
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
  });

  const validateSchema = schema.validate(params);
  if (validateSchema.error) {
    return res.status(status.BAD_REQUEST).send({
      status: false,
      message: validateSchema.error.details[0].message,
    });
  }
  const { name, image } = params;

  connection.query(
    "UPDATE `products` SET name=?, image=? WHERE id=?",
    [name, image, id],
    (error, result) => {
      if (error)
        return res
          .status(status.BAD_REQUEST)
          .send({ status: false, data: error });
      console.log("updated entry");
      if (result) {
        return res
          .status(status.OK)
          .send({ status: true, data: result.affectedRows });
      }
    }
  );
}

function reviewProduct(req, res) {
  const productId = req.params.id;
  const body = req.body;

  const schema = Joi.object().keys({
    review: Joi.string().required(),
    rating: Joi.number().required(),
  });

  // validate the request body
  const validateSchema = schema.validate(body);
  if (validateSchema.error) {
    return res.status(status.BAD_REQUEST).send({
      status: false,
      message: validateSchema.error.details[0].message,
    });
  }

  const { review, rating } = body;
  const id = uuid.v1();

  connection.execute(
    " INSERT INTO reviews (productId,id,review,rating) VALUES (?,?,?,?)",
    [productId, id, review, rating],
    (error, result) => {
      if (error)
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .send({ status: false, message: "Server error!" });

      if (result) {
        connection.execute(
          `SELECT id,name,image, (SELECT COUNT(rating) FROM reviews WHERE reviews.productId = products.id) as totalReviews, (SELECT SUM(rating) FROM reviews WHERE reviews.productId = products.id) as overallRating FROM products WHERE products.id=?`,
          [productId],
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(status.INTERNAL_SERVER_ERROR).send({
                status: false,
                message: "Error, could not retrieve data",
              });
            }
            if (result) {
              const product = result[0];
              if (product.overallRating) {
                product.overallRating = Number(
                  product.overallRating / product.totalReviews
                ).toFixed(1);
              }
              connection.query(
                "SELECT * FROM reviews WHERE productId=?",
                [productId],
                (error, result) => {
                  if (error)
                    return res
                      .status(status.INTERNAL_SERVER_ERROR)
                      .send({ status: false, message: "Server failure" });
                  product.reviews = result;
                  return res
                    .status(status.OK)
                    .send({ status: true, data: product });
                }
              );
            }
          }
        );
      }
    }
  );
}

module.exports = {
  getProducts,
  getMVPProduct,
  getProductById,
  createProduct,
  updateProduct,
  reviewProduct,
};
