const router =  require('express').Router();
const relation = require("../controllers/relation.ctrl");

router.post("/insert" , relation.insertRelation);
router.post("/update/:id" , relation.updateRelation);      
router.get("/getAll", relation.viewAllRelation);
router.delete("/delete/:id" , relation.deleteRelation);


module.exports = router;    