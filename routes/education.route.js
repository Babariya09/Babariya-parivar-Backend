const router = require('express').Router();
const education = require("../controllers/education.ctrl");

router.post("/insert" , education.insertEducation);
router.post("/update/:id" , education.updateEducation);
router.get("/getAll" , education.viewAllEducation);
router.delete("/delete/:id" , education.deleteEducation);

module.exports = router ; 