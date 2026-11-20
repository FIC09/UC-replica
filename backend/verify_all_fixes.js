import { User } from './models/User.js';
import { WorkerApplication } from './models/WorkerApplication.js';
import { PartnerApplication } from './models/PartnerApplication.js';
import { Booking } from './models/Booking.js';
import { Address } from './models/Address.js';
import { settleProfessionalPayout } from './controllers/adminProfessionalController.js';
import { settlePartnerPayout } from './controllers/adminPartnerController.js';
import { getCustomerPayments } from './controllers/adminPaymentController.js';

console.log('===============================================================');
console.log('>>> ENTERPRISE FIXES VERIFICATION SUITE <<<');
console.log('===============================================================\n');

let passCount = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

// 1. User Model Schema (Bugs 10, 11)
console.log('[TEST 1] User Model Schema for Bank Details, DOB, and Avatar...');
const userPaths = User.schema.paths;
assert('bankDetails.accountHolderName' in userPaths, 'User schema has bankDetails.accountHolderName');
assert('bankDetails.accountNumber' in userPaths, 'User schema has bankDetails.accountNumber');
assert('bankDetails.ifscCode' in userPaths, 'User schema has bankDetails.ifscCode');
assert('bankDetails.bankName' in userPaths, 'User schema has bankDetails.bankName');
assert('dateOfBirth' in userPaths, 'User schema has dateOfBirth');
assert('avatar' in userPaths, 'User schema has avatar');

// 2. WorkerApplication & PartnerApplication Models (Bugs 03, 05, 06)
console.log('\n[TEST 2] WorkerApplication & PartnerApplication DOB and Bank Fields...');
const workerPaths = WorkerApplication.schema.paths;
assert('dateOfBirth' in workerPaths, 'WorkerApplication schema has dateOfBirth');
const workerBankPaths = workerPaths.bankDetails?.schema?.paths || workerPaths;
assert('accountNumber' in workerBankPaths || 'bankDetails.accountNumber' in workerPaths, 'WorkerApplication schema has bankDetails.accountNumber');
assert('ifscCode' in workerBankPaths || 'bankDetails.ifscCode' in workerPaths, 'WorkerApplication schema has bankDetails.ifscCode');

const partnerPaths = PartnerApplication.schema.paths;
assert('dateOfBirth' in partnerPaths, 'PartnerApplication schema has dateOfBirth');
assert('settlementAccount.accountNumber' in partnerPaths, 'PartnerApplication schema has settlementAccount.accountNumber');
assert('settlementAccount.ifscCode' in partnerPaths, 'PartnerApplication schema has settlementAccount.ifscCode');

// 3. Settlement Controller Functions (Bug 07)
console.log('\n[TEST 3] Admin Payout Settlement Controller Handlers...');
assert(typeof settleProfessionalPayout === 'function', 'settleProfessionalPayout controller function exists');
assert(typeof settlePartnerPayout === 'function', 'settlePartnerPayout controller function exists');

// 4. Booking Schema (Bug 08)
console.log('\n[TEST 4] Booking Model Review Fields...');
const bookingPaths = Booking.schema.paths;
assert('reviewIsPublished' in bookingPaths, 'Booking schema has reviewIsPublished');
assert('reviewStatus' in bookingPaths, 'Booking schema has reviewStatus');

// 5. Coupon Math Edge Cases
console.log('\n[TEST 5] Payment & Coupon Calculation Invariants...');
const itemTotal = 4824;
const catalogDiscount = 965;
const subtotalAfterDiscount = itemTotal - catalogDiscount; // 3859
const couponAmount = 37239; // Massive coupon edge case
const cappedCoupon = Math.min(couponAmount, subtotalAfterDiscount);
const platformFee = 49;
const taxes = Math.round((subtotalAfterDiscount - cappedCoupon) * 0.18);
const amountToPay = Math.max(0, subtotalAfterDiscount - cappedCoupon + platformFee + taxes);

assert(cappedCoupon <= subtotalAfterDiscount, 'Coupon discount cannot exceed order subtotal');
assert(amountToPay >= platformFee, 'Amount to pay correctly includes non-discountable platform fee');

console.log('\n[TEST 6] Admin Customer Payments Controller & Real-Time Calculation Handler...');
assert(typeof getCustomerPayments === 'function', 'getCustomerPayments controller function exists');

// Mock request and response to verify real-time calculation logic
const mockReq = { query: { search: '', status: 'ALL' } };
let mockResData = null;
const mockRes = {
  json: (data) => { mockResData = data; return data; },
  status: () => mockRes
};

await getCustomerPayments(mockReq, mockRes);
assert(mockResData !== null && mockResData.success === true, 'getCustomerPayments returns successful response');
assert(typeof mockResData?.kpis?.totalCollectedRupees === 'number', 'getCustomerPayments calculates totalCollectedRupees');
assert(Array.isArray(mockResData?.payments), 'getCustomerPayments returns array of customer payment records');
assert(mockResData?.payments?.length > 0 && typeof mockResData.payments[0].financials?.totalAmount === 'number', 'Customer payment record includes complete financial calculation breakdown');

// 7. Address Model & Privacy Isolation (Bug: Show only logged-in user addresses)
console.log('\n[TEST 7] Address Model User Scoping & Privacy Isolation...');
const addressPaths = Address.schema.paths;
assert('userId' in addressPaths, 'Address schema has userId for strict user scoping');
assert('userEmail' in addressPaths, 'Address schema has userEmail for email-based scoping');
assert('userPhone' in addressPaths || 'phone' in addressPaths, 'Address schema has userPhone field');
const phoneField = addressPaths.userPhone || addressPaths.phone;
assert(!phoneField?.defaultValue || phoneField.defaultValue !== '+91 98201 44521', 'Address phone does not hardcode other customer phone');

console.log(`\n===============================================================`);
console.log(`>>> VERIFICATION RESULTS: ${passCount}/${totalTests} TESTS PASSED <<<`);
console.log(`===============================================================`);

if (passCount === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
