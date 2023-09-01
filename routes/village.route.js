const router = require('express').Router();
const village = require("../controllers/village.ctrl");

router.post("/insert" , village.insertVillage);
router.post("/update/:id" , village.updateVillage);
router.get("/getOne/:id" , village.getVillage);
router.get("/getAll" , village.viewAllVillage);
router.delete("/delete/:id" , village.deleteVillage);

module.exports = router ; 