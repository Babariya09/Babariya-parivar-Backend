const router =  require('express').Router();
const admin = require("../controllers/admin.ctrl");

const { verifyAdmin } = require("../middleware/admin.middle");

router.post("/insert" , admin.insertAdmin);
router.post("/login" , admin.login);
router.post("/changePassword" ,verifyAdmin, admin.changePassword);
router.post("/updateProfile/:id" , admin.updateProfile);

module.exports = router;