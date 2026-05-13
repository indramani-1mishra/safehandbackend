const assert = require("assert");
const { generateServiceInvoiceTemplate } = require("./serviceInvocetemplate");

const paymentdetails = {
    jobCardId: "650000000000000000000000",
    _id: "650000000000000000000001",
    amount: 2500, 
    paymentDate: "2026-05-13T10:00:00.000Z",
    createdAt: "2026-05-13T10:00:00.000Z",
    paymentMethod: "upi",
    paymentStatus: "paid",
    remainingAmount: 0,
    paidFromDate: "2026-05-01T00:00:00.000Z",
    paidUntilNow: "2026-05-10T00:00:00.000Z",
    proofUrl: "https://example.com/proof.png",
    clientName: "Test Client",
    clientPhone: "9999999999",
    clientAddress: "Test Address, Noida",
    serviceName: "Nursing Service",
    invoiceNumber: "INV-2026-0001",
    clientPincode: "201301",
    serviceStartDate: "2026-05-01T00:00:00.000Z"
};

const html = generateServiceInvoiceTemplate(paymentdetails);

assert(html.includes("GST</span><span>0%</span>"), "Invoice should display GST as 0%.");
assert(html.includes("Nursing Service"), "Invoice should render the service name.");
assert(html.includes("Paid Until"), "Invoice should include Paid Until field.");
assert(html.includes("Service Start"), "Invoice should include Service Start field.");
assert(html.includes("Payment received successfully."), "Invoice should include the required terms and conditions text.");

console.log("serviceInvocetemplate test passed");
