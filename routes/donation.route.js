const router =  require('express').Router();
const donation = require("../controllers/donation.ctrl");

router.post("/insert/:mainMemberId" , donation.insertDonation);
router.post("/update/:id" ,donation.updateDonation);
router.get("/viewAll" , donation.viewAllDonation);
router.delete("/delete/:id" , donation.deleteDonation);
router.get("/donationByMemberId/:member_id" , donation.viewDonationByMemberId);

module.exports = router;