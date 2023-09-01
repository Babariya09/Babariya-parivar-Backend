const router =  require('express').Router();
const result = require("../controllers/result.ctrl");

router.post("/insert/:mainMemberId/:subMemberId" , result.insertResult);
router.post("/update/:id" , result.updateResult);      
router.get("/getOne/:id", result.viewResultById);
router.get("/getAll", result.viewAllResult);
router.delete("/delete/:id" , result.deleteResult);
router.get("/renkerStudent" , result.renkerStudent);
router.get("/resultByMainMember/:member_id" , result.viewResultByMainMemberId);
router.get("/resultBySubMember/:sub_member_id" , result.viewResultBySubMemberId);


module.exports = router;