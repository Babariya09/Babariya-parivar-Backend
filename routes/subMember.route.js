const router = require("express").Router();
const subController = require("../controllers/subMember.ctrl");

router.post("/insert/:mainMemberId" , subController.insertSubMember);
router.post("/update/:id", subController.updateSubMember);
router.get("/getOne/:id" , subController.viewSubMemberById);
router.get("/viewAll" , subController.viewAllsubMember);
router.delete("/delete/:id",subController.deleteSubMember);
router.get("/totalSubMember",  subController.totalSubMember);
router.get("/subMemberByMainMember/:member_id" , subController.viewSubMemberByMainMemberId);

module.exports = router;