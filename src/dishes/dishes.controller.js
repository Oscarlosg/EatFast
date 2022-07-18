const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: dishes });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName] && data["price"] > 0) {
      return next();
    }
    if (data["price"] < 1 || !data["price"]) {
      next({ status: 400, message: `Dish must include a price` });
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

function idMatches(req, res, next) {
  const { dishId } = req.params;
  const {
    data: { id },
  } = req.body;
  if (Number(id) === Number(dishId) || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Updated dish id must match current dish's id - id given: ${id} - correct id: ${dishId}`,
  });
}

function isNumber(req, res, next) {
  const dish = res.locals.dish;
  if (typeof dish.price !== "string") {
    return next();
  }
  next({
    status: 400,
    message: `Updated dish price must be a number`,
  });
}

function create(req, res, next) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id == dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { dishId } = req.params;
  const {
    data: { id, name, description, price, image_url },
  } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    idMatches,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    isNumber,
    update,
  ],
};
