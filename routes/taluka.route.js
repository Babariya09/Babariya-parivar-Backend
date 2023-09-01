const router =  require('express').Router();
const taluka = require("../controllers/taluka.ctrl");

router.post("/insert" , taluka.insertTaluka);
router.post("/update/:id" , taluka.updateTaluka);
router.get("/getOne/:id" , taluka.getTaluka);
router.get("/getAll" , taluka.getAllTaluka);
router.delete("/delete/:id" , taluka.deleteTaluka);

module.exports = router;