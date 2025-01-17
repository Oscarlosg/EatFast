const router = require("express").Router({ mergeParams: true });
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /orders routes needed to make the tests pass

router.route("/").get(controller.list).post(controller.create);

router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete);

module.exports = router;
