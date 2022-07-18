const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: orders });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Order must include a ${propertyName}` });
  };
}

const checkOrder = (req, res, next) => {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  if (!deliverTo || deliverTo == "")
    return next({ status: 400, message: `Order must include a deliverTo` });
  if (!mobileNumber || mobileNumber == "")
    return next({ status: 400, message: `Order must include a mobileNumber` });
  if (!dishes)
    return next({ status: 400, message: `Order must include a dish` });
  if (!Array.isArray(dishes) || dishes.length <= 0)
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });

  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity != "number"
    )
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
  });

  res.locals.newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };

  next();
};

function create(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

const orderExists = (req, res, next) => {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id == orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({ status: 404, message: `Order with id ${orderId} does not exist` });
};

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  res.json({ data: order });
}

function idMatches(req, res, next) {
  const { orderId } = req.params;
  const {
    data: { id },
  } = req.body;
  if (Number(id) === Number(orderId) || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Updated order id must match current order's id - id given: ${id} - correct id: ${orderId}`,
  });
}
function statusChecker(keyword) {
  return function Checker(req, res, next) {
    const { data: { status } = {} } = req.body;

    if (status !== `${keyword}`) {
      return next();
    }
    next({
      status: 400,
      message: `status must not be '${keyword}'`,
    });
  };
}

function statusCheckerDelete(req, res, next) {
  const order = res.locals.order;
  if (order.status == `pending`) {
    return next();
  }
  next({
    status: 400,
    message: `status must be 'pending'`,
  });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  // `splice()` returns an array of the deleted elements, even if it is one element
  const deletedOrder = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    checkOrder,
    create,
  ],
  read: [orderExists, read],
  update: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("status"),
    checkOrder,
    orderExists,
    idMatches,
    statusChecker("invalid"),
    update,
  ],
  delete: [orderExists, statusCheckerDelete, destroy],
};
