const router = require('express').Router();
const district = require("../controllers/district.ctrl");

router.post("/insert" , district.insertDistrict);
router.post("/update/:id" , district.updateDistrict);
router.get("/getOne/:id" , district.getDistrict);
router.get("/getAll" , district.viewAllDistrict);
router.delete("/delete/:id" , district.deleteDistrict);

module.exports = router ; 