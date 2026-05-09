const express = require("express");
const router  = express.Router();
const { protect, authorize, tenantGuard } = require("../middleware/auth");
const {
  getFeeStructures,
  upsertFeeStructure,
  generateFees,
  getFees,
  createManualFee,
  updateFee,
  getFeeSummary,
  getStudentFees,
} = require("../controllers/fee.controller");

router.use(protect, tenantGuard);

// Fee structures (class-level config)
router.get(  "/structures",          authorize("schooladmin"), getFeeStructures);
router.post( "/structures",          authorize("schooladmin"), upsertFeeStructure);

// Bulk fee generation
router.post( "/generate",            authorize("schooladmin"), generateFees);

// Summary
router.get(  "/summary",             authorize("schooladmin"), getFeeSummary);

// Per-student history
router.get(  "/student/:studentId",  authorize("schooladmin"), getStudentFees);

// Voucher CRUD
router.get(  "/",   authorize("schooladmin"), getFees);
router.post( "/",   authorize("schooladmin"), createManualFee);
router.put(  "/:id",authorize("schooladmin"), updateFee);

module.exports = router;
