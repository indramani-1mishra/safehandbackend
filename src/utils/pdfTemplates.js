const fs = require('fs');
const path = require('path');

// Read the background image and convert it to base64
const imagePath = path.join(__dirname, '..', 'important_assest', 'companywatermark.jpeg');
let backgroundImage = '';
try {
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    backgroundImage = `data:image/jpeg;base64,${imageBase64}`;
} catch (error) {
    console.error("Error loading background image for PDF:", error.message);
}

const commonStyles = `
    @page {
        size: A4;
        margin: 0;
    }
    body { 
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0; 
        padding: 0;
        width: 210mm;
        height: 297mm;
        position: relative;
    }
    .letterhead {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
    .letterhead img {
        width: 100%;
        height: 100%;
        display: block;
    }
    .content-wrapper {
        position: relative;
        z-index: 10;
        padding-top: 150px; /* Space for letterhead header */
        padding-bottom: 100px; /* Space for letterhead footer */
        padding-left: 50px;
        padding-right: 50px;
        box-sizing: border-box;
    }
    .section { margin-bottom: 25px; }
    .section-title { 
        font-size: 16px; font-weight: 700; color: #0369a1;
        margin-bottom: 12px; border-bottom: 1px solid #e2e8f0;
        padding-bottom: 5px; text-transform: uppercase;
    }
    .card { 
        background: rgba(240, 249, 255, 0.7); 
        border: 1px solid #e2e8f0; 
        border-radius: 8px; padding: 15px;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { display: flex; flex-direction: column; gap: 2px; }
    .label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .value { font-size: 14px; font-weight: 500; color: #1e293b; }
    .highlight { color: #0369a1; font-weight: 700; }
    .status-badge {
        display: inline-block; padding: 2px 10px; border-radius: 9999px;
        background: #dcfce7; color: #166534; font-size: 11px; font-weight: 600;
        float: right;
    }
`;

const generateWorkerPdfTemplate = (jobcart, worker) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            ${commonStyles}
        </style>
    </head>
    <body>
        <div class="letterhead">
            <img src="${backgroundImage}" alt="Letterhead">
        </div>
        <div class="content-wrapper">
            <div style="margin-bottom: 20px;">
                <span class="status-badge">Worker Copy - Assigned</span>
                <div style="font-size: 12px; color: #64748b;">Date: ${new Date(jobcart.assignedAt || Date.now()).toLocaleDateString()}</div>
            </div>

            <div class="section">
                <div class="section-title">Assignment for Worker</div>
                <div class="card">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Worker Name</span>
                            <span class="value">${worker.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Worker ID</span>
                            <span class="value">${worker.workerId}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Patient & Location Details</div>
                <div class="card">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Patient Name</span>
                            <span class="value">${jobcart.patientDetails.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Age / Gender</span>
                            <span class="value">${jobcart.patientDetails.age} / ${jobcart.patientDetails.gender}</span>
                        </div>
                        <div class="info-item" style="grid-column: span 2">
                            <span class="label">Address</span>
                            <span class="value">${jobcart.patientDetails.address}, ${jobcart.patientDetails.city}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Service & Salary Details</div>
                <div class="card">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Service</span>
                            <span class="value">${jobcart.serviceDetails.service.name || 'Healthcare Service'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Plan / Timing</span>
                            <span class="value" style="text-transform: capitalize;">${jobcart.serviceDetails.plan} / ${jobcart.serviceDetails.timing}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Start Date</span>
                            <span class="value highlight">${new Date(jobcart.serviceStart).toLocaleDateString()}</span>
                        </div>
                       
                       
                        <div class="info-item">
                            <span class="label">Payment Cycle</span>
                            <span class="value">${jobcart.nursePaymentCycleDays} Days</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Per Day Salary</span>
                            <span class="value">₹${jobcart.perDayNurseCost}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Total Salary</span>
                            <span class="value highlight">₹${jobcart.totalNurseSalary}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateClientPdfTemplate = (jobcart, worker) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            ${commonStyles}
            .worker-profile { display: flex; gap: 20px; align-items: center; }
            .worker-photo { 
                width: 80px; height: 80px; border-radius: 50%; object-fit: cover; 
                border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .price-tag { 
                background: #8b5cf6; color: white; padding: 10px 20px; 
                border-radius: 8px; text-align: right; margin-top: 10px;
                display: inline-block; float: right;
            }
        </style>
    </head>
    <body>
        <div class="letterhead">
            <img src="${backgroundImage}" alt="Letterhead">
        </div>
        <div class="content-wrapper">
            <div style="text-align: right; margin-bottom: 20px;">
                <p style="margin: 0; font-weight: 700; color: #6d28d9;">Customer Copy - Job Assigned</p>
                <p style="margin: 2px 0 0; font-size: 11px; color: #64748b">Order ID: #${jobcart._id.toString().slice(-6).toUpperCase()}</p>
            </div>

            <div class="section">
                <div class="section-title">Your Assigned Caregiver</div>
                <div class="card">
                    <div class="worker-profile">
                        <img class="worker-photo" src="${worker.photo || 'https://via.placeholder.com/150'}" alt="Worker Photo">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Name</span>
                                <span class="value">${worker.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">ID</span>
                                <span class="value">${worker.workerId}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Age / Gender</span>
                                <span class="value">${worker.age} / ${worker.gender}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Service & Payment Details</div>
                <div class="card">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Service Name</span>
                            <span class="value">${jobcart.serviceDetails.service.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Plan / Timing</span>
                            <span class="value" style="text-transform: capitalize;">${jobcart.serviceDetails.plan} / ${jobcart.serviceDetails.timing}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Start Date</span>
                            <span class="value">${new Date(jobcart.serviceStart).toLocaleDateString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">End Date</span>
                            <span class="value">${new Date(jobcart.serviceEnd).toLocaleDateString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Total Days</span>
                            <span class="value">${jobcart.totalDays} Days</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Payment Cycle</span>
                            <span class="value">${jobcart.customerPaymentCycleDays} Days</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Assigned To</span>
                            <span class="value">${jobcart.patientDetails.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Per Day Cost</span>
                            <span class="value">₹${jobcart.perDayCustomerCost}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="overflow: hidden; margin-top: 10px;">
                <div class="price-tag">
                    <div style="font-size: 10px; opacity: 0.9;">Total Deal Amount</div>
                    <div style="font-size: 20px; font-weight: 800;">₹${jobcart.totalDealAmount}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateAdminPdfTemplate = (jobcart, worker) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            ${commonStyles}
            .admin-header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }
            .admin-title { font-size: 20px; font-weight: 800; color: #0f172a; }
            .finance-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .finance-table th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; }
            .finance-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .profit-box { background: #dcfce7; color: #166534; padding: 12px; border-radius: 8px; text-align: right; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="letterhead">
            <img src="${backgroundImage}" alt="Letterhead">
        </div>
        <div class="content-wrapper">
            <div class="admin-header">
                <div class="admin-title">Internal Assignment Report (Admin)</div>
                <div style="font-size: 11px; color: #64748b">Job ID: ${jobcart._id} | Date: ${new Date().toLocaleString()}</div>
            </div>

            <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <div class="section-title">Patient Details</div>
                    <div class="info-item"><span class="label">Name</span><span class="value">${jobcart.patientDetails.name}</span></div>
                    <div class="info-item"><span class="label">Phone</span><span class="value">${jobcart.patientDetails.phone}</span></div>
                    <div class="info-item"><span class="label">Age / Gender</span><span class="value">${jobcart.patientDetails.age} / ${jobcart.patientDetails.gender}</span></div>
                    <div class="info-item"><span class="label">Address</span><span class="value">${jobcart.patientDetails.address}, ${jobcart.patientDetails.city}</span></div>
                </div>
                <div>
                    <div class="section-title">Worker Details</div>
                    <div class="info-item"><span class="label">Name</span><span class="value">${worker.name}</span></div>
                    <div class="info-item"><span class="label">ID</span><span class="value">${worker.workerId}</span></div>
                    <div class="info-item"><span class="label">Phone</span><span class="value">${worker.phone}</span></div>
                    <div class="info-item"><span class="label">Email</span><span class="value">${worker.email}</span></div>
                </div>
            </div>

            <div class="section-title">Job & Service Breakdown</div>
            <div class="card" style="margin-bottom: 20px;">
                <div class="info-grid">
                    <div class="info-item"><span class="label">Service</span><span class="value">${jobcart.serviceDetails.service.name}</span></div>
                    <div class="info-item"><span class="label">Total Days</span><span class="value">${jobcart.totalDays}</span></div>
                    <div class="info-item"><span class="label">Start Date</span><span class="value">${new Date(jobcart.serviceStart).toLocaleDateString()}</span></div>
                    <div class="info-item"><span class="label">End Date</span><span class="value">${new Date(jobcart.serviceEnd).toLocaleDateString()}</span></div>
                </div>
            </div>

            <div class="section-title">Financial Breakdown</div>
            <table class="finance-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Client side (₹)</th>
                        <th>Worker side (₹)</th>
                        <th>Profit (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Per Day Cost</td>
                        <td>${jobcart.perDayCustomerCost}</td>
                        <td>${jobcart.perDayNurseCost}</td>
                        <td>${jobcart.perDayCustomerCost - jobcart.perDayNurseCost}</td>
                    </tr>
                    <tr>
                        <td>Payment Cycle</td>
                        <td>${jobcart.customerPaymentCycleDays} Days</td>
                        <td>${jobcart.nursePaymentCycleDays} Days</td>
                        <td>-</td>
                    </tr>
                    <tr style="font-weight: bold; background: #f8fafc;">
                        <td>Total Amount</td>
                        <td>${jobcart.totalDealAmount}</td>
                        <td>${jobcart.totalNurseSalary}</td>
                        <td>${jobcart.totalDealAmount - jobcart.totalNurseSalary}</td>
                    </tr>
                </tbody>
            </table>

            <div class="profit-box">
                <div style="font-size: 10px; opacity: 0.8">Net Revenue for SafeHand</div>
                <div style="font-size: 20px; font-weight: 900">₹${Number(jobcart.totalDealAmount) - Number(jobcart.totalNurseSalary)}</div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generateWorkerPdfTemplate,
    generateClientPdfTemplate,
    generateAdminPdfTemplate
};
