const router =  require('express').Router();
const bg = require("../controllers/bloodGroup.ctrl");

router.post("/insert" , bg.insertBloodGroup);
router.post("/update/:id" , bg.updateBloodGroup);      
router.get("/getAll", bg.viewAllBloodGroup);
router.delete("/delete/:id" , bg.deleteBloodGroup);
    

module.exports = router;    