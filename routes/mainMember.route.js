const router = require("express").Router();
const mainController = require("../controllers/mainMember.ctrl");

router.post("/insert" , mainController.insertMember);
router.post("/update/:id", mainController.updateMember);
router.get("/getOne/:id" , mainController.viewMemberById);
router.get("/viewAll" , mainController.viewAllMember);
router.delete("/delete/:id",mainController.deleteMember);
router.get("/totalMembers" , mainController.totalMember);
router.get("/commiteeMembers" , mainController.commiteeMemberList);
// router.get("/deletedMembers" , mainController.getdeletedMembers);
router.get("/allActive" , mainController.viewAllActiveMember);
router.get("/alldeleted" , mainController.deleteMemberList);
router.get("/deletedMember/:id" , mainController.searchDeleteMember);

module.exports = router;    