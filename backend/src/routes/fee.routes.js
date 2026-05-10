const express = require("express");
const router  = express.Router();
const { protect, authorize, tenantGuard } = require("../middleware/auth");
const {
  getFeeStructures,
  upsertFeeStructure,
  deleteFeeStructure,
  generateFees,
  getFees,
  createManualFee,
  updateFee,
  getFeeSummary,
  getStudentFees,
  getVoucherById,
} = require("../controllers/fee.controller");

router.use(protect, tenantGuard);

// Fee structures (class-level config)
router.get(  "/structures",          authorize("schooladmin", "teacher"), getFeeStructures);
router.post( "/structures",          authorize("schooladmin"), upsertFeeStructure);
router.put(  "/structures/:id",      authorize("schooladmin"), upsertFeeStructure);
router.delete("/structures/:id",     authorize("schooladmin"), deleteFeeStructure);

// Bulk fee generation
router.post( "/generate",            authorize("schooladmin", "teacher"), generateFees);

// Summary
router.get(  "/summary",             authorize("schooladmin", "teacher"), getFeeSummary);

// Student fee endpoints
router.get(  "/student/:studentId",  authorize("schooladmin", "teacher"), getStudentFees);

// Voucher CRUD
router.get(  "/",   authorize("schooladmin", "teacher"), getFees);
router.post( "/",   authorize("schooladmin"), createManualFee);
router.get(  "/:id",authorize("schooladmin", "teacher"), getVoucherById);
router.put(  "/:id",authorize("schooladmin", "teacher"), updateFee);

module.exports = router;
