const router = require('express').Router();
const occupation = require("../controllers/occupation.ctrl");

router.post("/insert" , occupation.insertOccupation);
router.post("/update/:id" , occupation.updateOccupation);
router.get("/getAll" , occupation.getAllOccupation);
router.delete("/delete/:id" , occupation.deleteOccupation);

module.exports = router ; 