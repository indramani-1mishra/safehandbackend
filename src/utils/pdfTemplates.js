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

const safeValue = (value, fallback = '') => (value === undefined || value === null ? fallback : value);
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '';
const formatCurrency = (value) => (value !== undefined && value !== null && value !== '' ? `₹${value}` : '');
const renderInfoItem = (label, value, extraStyle = '') => {
    if (value === undefined || value === null || value === '') return '';
    return `
        <div class="info-item" style="${extraStyle}">
            <span class="label">${label}</span>
            <span class="value">${value}</span>
        </div>`;
};

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

const generateWorkerPdfTemplate = (jobcart, worker, mode = 'assignment') => {
    const workerCopyLabel = mode === 'replacement' ? 'Worker Copy - Replacement' : 'Worker Copy - Assigned';
    const patient = jobcart?.patientDetails || {};
    const serviceName = jobcart?.serviceDetails?.service?.name || 'Healthcare Service';
    const planTiming = [jobcart?.serviceDetails?.plan, jobcart?.serviceDetails?.timing].filter(Boolean).join(' / ');
    const ageGender = [patient.age, patient.gender].filter(Boolean).join(' / ');
    const addressLine = [patient.address, patient.city].filter(Boolean).join(', ');
    const dateText = formatDate(jobcart?.assignedAt || Date.now());
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
                <span class="status-badge">${workerCopyLabel}</span>
                ${renderInfoItem('Date', dateText, 'font-size: 12px; color: #64748b; display: block;')}
            </div>

            <div class="section">
                <div class="section-title">Assignment for Worker</div>
                <div class="card">
                    <div class="info-grid">
                        ${renderInfoItem('Worker Name', safeValue(worker?.name))}
                        ${renderInfoItem('Worker ID', safeValue(worker?.workerId))}
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Patient & Location Details</div>
                <div class="card">
                    <div class="info-grid">
                        ${renderInfoItem('Patient Name', safeValue(patient.name))}
                        ${renderInfoItem('Age / Gender', ageGender)}
                        ${renderInfoItem('Address', addressLine, 'grid-column: span 2')}
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Service & Salary Details</div>
                <div class="card">
                    <div class="info-grid">
                        ${renderInfoItem('Service', serviceName)}
                        ${renderInfoItem('Plan / Timing', planTiming)}
                        ${renderInfoItem('Start Date', formatDate(jobcart?.serviceStart))}
                        ${renderInfoItem('Payment Cycle', jobcart?.nursePaymentCycleDays ? `${jobcart.nursePaymentCycleDays} Days` : '')}
                        ${renderInfoItem('Per Day Salary', formatCurrency(jobcart?.perDayNurseCost))}
                        ${renderInfoItem('Total Salary', formatCurrency(jobcart?.totalNurseSalary))}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateClientPdfTemplate = (jobcart, worker, mode = 'assignment') => {
    const clientCopyLabel = mode === 'replacement' ? 'Customer Copy - Worker Replaced' : 'Customer Copy - Job Assigned';
    const clientMessage = mode === 'replacement'
        ? 'Your caregiver assignment has changed. Please review the updated details below.'
        : 'Your caregiver assignment details are below.';
    const serviceName = jobcart?.serviceDetails?.service?.name || 'Healthcare Service';
    const planTiming = [jobcart?.serviceDetails?.plan, jobcart?.serviceDetails?.timing].filter(Boolean).join(' / ');
    const startDate = formatDate(jobcart?.serviceStart);
    const endDate = formatDate(jobcart?.serviceEnd);
    const totalDays = jobcart?.totalDays ? `${jobcart.totalDays} Days` : '';
    const paymentCycle = jobcart?.customerPaymentCycleDays ? `${jobcart.customerPaymentCycleDays} Days` : '';
    const assignedTo = safeValue(jobcart?.patientDetails?.name);
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
                <p style="margin: 0; font-weight: 700; color: #6d28d9;">${clientCopyLabel}</p>
                ${renderInfoItem('Order ID', safeValue(jobcart?._id ? jobcart._id.toString().slice(-6).toUpperCase() : ''))}
                ${renderInfoItem('', clientMessage, 'margin: 4px 0 0; font-size: 12px; color: #475569;')}
            </div>

            <div class="section">
                <div class="section-title">Your Assigned Caregiver</div>
                <div class="card">
                    <div class="worker-profile">
                        <img class="worker-photo" src="${worker?.photo || 'https://via.placeholder.com/150'}" alt="Worker Photo">
                        <div class="info-grid">
                            ${renderInfoItem('Name', safeValue(worker?.name))}
                            ${renderInfoItem('ID', safeValue(worker?.workerId))}
                            ${renderInfoItem('Age / Gender', [worker?.age, worker?.gender].filter(Boolean).join(' / '))}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Service & Payment Details</div>
                <div class="card">
                    <div class="info-grid">
                        ${renderInfoItem('Service Name', serviceName)}
                        ${renderInfoItem('Plan / Timing', planTiming)}
                        ${renderInfoItem('Start Date', startDate)}
                        ${renderInfoItem('End Date', endDate)}
                        ${renderInfoItem('Total Days', totalDays)}
                        ${renderInfoItem('Payment Cycle', paymentCycle)}
                        ${renderInfoItem('Assigned To', assignedTo)}
                        ${renderInfoItem('Per Day Cost', formatCurrency(jobcart?.perDayCustomerCost))}
                    </div>
                </div>
            </div>

            ${jobcart?.totalDealAmount ? `<div style="overflow: hidden; margin-top: 10px;"><div class="price-tag"><div style="font-size: 10px; opacity: 0.9;">Total Deal Amount</div><div style="font-size: 20px; font-weight: 800;">${formatCurrency(jobcart.totalDealAmount)}</div></div></div>` : ''}
        </div>
    </body>
    </html>
    `;
};

const generateAdminPdfTemplate = (jobcart, worker, mode = 'assignment') => {
    const adminTitle = mode === 'replacement' ? 'Internal Replacement Report' : 'Internal Assignment Report (Admin)';
    const adminSubtitle = mode === 'replacement'
        ? 'A replacement worker has been assigned to this job card.'
        : 'Details of the assigned worker and financial breakdown.';
    const patient = jobcart?.patientDetails || {};
    const serviceName = jobcart?.serviceDetails?.service?.name || 'Healthcare Service';
    const ageGender = [patient.age, patient.gender].filter(Boolean).join(' / ');
    const addressLine = [patient.address, patient.city].filter(Boolean).join(', ');
    const jobId = safeValue(jobcart?._id ? jobcart._id.toString() : '');
    const totalClientCost = formatCurrency(jobcart?.perDayCustomerCost);
    const totalWorkerCost = formatCurrency(jobcart?.perDayNurseCost);
    const totalRevenue = jobcart?.perDayCustomerCost !== undefined && jobcart?.perDayNurseCost !== undefined ? formatCurrency(jobcart.perDayCustomerCost - jobcart.perDayNurseCost) : '';
    const totalDeal = formatCurrency(jobcart?.totalDealAmount);
    const totalSalary = formatCurrency(jobcart?.totalNurseSalary);
    const netRevenue = (jobcart?.totalDealAmount !== undefined && jobcart?.totalNurseSalary !== undefined)
        ? formatCurrency(Number(jobcart.totalDealAmount) - Number(jobcart.totalNurseSalary))
        : '';
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
                <div class="admin-title">${adminTitle}</div>
                <div style="font-size: 11px; color: #64748b">${adminSubtitle}${jobId ? ` Job ID: ${jobId}` : ''} | Date: ${new Date().toLocaleString()}</div>
            </div>

            <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <div class="section-title">Patient Details</div>
                    ${renderInfoItem('Name', safeValue(patient.name))}
                    ${renderInfoItem('Phone', safeValue(patient.phone))}
                    ${renderInfoItem('Age / Gender', ageGender)}
                    ${renderInfoItem('Address', addressLine)}
                </div>
                <div>
                    <div class="section-title">Worker Details</div>
                    ${renderInfoItem('Name', safeValue(worker?.name))}
                    ${renderInfoItem('ID', safeValue(worker?.workerId))}
                    ${renderInfoItem('Phone', safeValue(worker?.phone))}
                    ${renderInfoItem('Email', safeValue(worker?.email))}
                </div>
            </div>

            <div class="section-title">Job & Service Breakdown</div>
            <div class="card" style="margin-bottom: 20px;">
                <div class="info-grid">
                    ${renderInfoItem('Service', serviceName)}
                    ${renderInfoItem('Total Days', safeValue(jobcart?.totalDays ? `${jobcart.totalDays}` : ''))}
                    ${renderInfoItem('Start Date', formatDate(jobcart?.serviceStart))}
                    ${renderInfoItem('End Date', formatDate(jobcart?.serviceEnd))}
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
                        <td>${totalClientCost}</td>
                        <td>${totalWorkerCost}</td>
                        <td>${totalRevenue}</td>
                    </tr>
                    <tr>
                        <td>Payment Cycle</td>
                        <td>${safeValue(jobcart?.customerPaymentCycleDays ? `${jobcart.customerPaymentCycleDays} Days` : '')}</td>
                        <td>${safeValue(jobcart?.nursePaymentCycleDays ? `${jobcart.nursePaymentCycleDays} Days` : '')}</td>
                        <td>-</td>
                    </tr>
                    <tr style="font-weight: bold; background: #f8fafc;">
                        <td>Total Amount</td>
                        <td>${totalDeal}</td>
                        <td>${totalSalary}</td>
                        <td>${netRevenue}</td>
                    </tr>
                </tbody>
            </table>

            ${netRevenue ? `<div class="profit-box"><div style="font-size: 10px; opacity: 0.8">Net Revenue for SafeHand</div><div style="font-size: 20px; font-weight: 900">${netRevenue}</div></div>` : ''}
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
