const generateServiceInvoiceTemplate = (paymentdetails) => {
    // GST is 0% because healthcare services provided by Safehand Lifecare are exempt from GST under Indian tax laws.
    const {
        jobCardId,
        amount,
        paymentDate,
        paymentMethod,
        paymentStatus,
        remainingAmount,
        paidFromDate,
        paidUntilNow,
        proofUrl,
        createdAt,
        clientName,
        clientPhone,
        clientAddress,
        serviceName,
        invoiceNumber,
        clientPincode,
        serviceStartDate

    } = paymentdetails;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

    const statusColor = paymentStatus === 'paid' ? '#16a34a' : paymentStatus === 'failed' ? '#dc2626' : '#d97706';
    const statusBg = paymentStatus === 'paid' ? '#dcfce7' : paymentStatus === 'failed' ? '#fee2e2' : '#fef3c7';

    const bgImg = paymentdetails.backgroundImage
        ? `<img src="${paymentdetails.backgroundImage}" alt="Letterhead Background">`
        : '';

    const invoiceNo = invoiceNumber || (jobCardId ? jobCardId.toString().slice(-6).toUpperCase() : 'XXXXXX');
    const invoiceRef = jobCardId ? '#' + jobCardId.toString().slice(-8).toUpperCase() : 'N/A';
    const paymentId = paymentdetails._id ? '#' + paymentdetails._id.toString().slice(-10).toUpperCase() : 'N/A';

    const proofBlock = proofUrl
        ? `<div class="proof-section">&#128206; <strong>Payment Proof:</strong> <a href="${proofUrl}" target="_blank">${proofUrl}</a></div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Safehand Lifecare</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --teal: #0d9488; --teal-light: #ccfbf1; --teal-dark: #0f766e;
            --navy: #0f172a; --slate: #475569; --silver: #f1f5f9;
            --white: #ffffff; --border: #e2e8f0; --text: #1e293b;
        }
        @page { margin: 0; size: A4; }
        body {
            font-family: 'DM Sans', sans-serif;
            color: var(--text);
            background: var(--silver);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .invoice-wrapper {
            max-width: 794px; margin: 0 auto;
            background: var(--white); min-height: 1123px;
            position: relative; overflow: hidden;
            box-shadow: 0 25px 60px rgba(0,0,0,0.15);
        }
        .letterhead-bg { position: absolute; inset: 0; z-index: 0; }
        .letterhead-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.07; }
        .corner-tl {
            position: absolute; top: 0; left: 0;
            width: 200px; height: 200px;
            background: linear-gradient(135deg, var(--teal) 0%, transparent 60%);
            opacity: 0.12; z-index: 0;
        }
        .corner-br {
            position: absolute; bottom: 0; right: 0;
            width: 180px; height: 180px;
            background: linear-gradient(315deg, var(--teal-dark) 0%, transparent 60%);
            opacity: 0.1; z-index: 0;
        }
        .invoice-content { position: relative; z-index: 1; }

        /* HEADER */
        .header {
            background: linear-gradient(135deg, var(--navy) 0%, #1e3a5f 50%, var(--teal-dark) 100%);
            padding: 32px 40px 28px;
            display: flex; justify-content: space-between; align-items: flex-start;
            position: relative; overflow: hidden;
        }
        .header::after {
            content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--teal) 0%, #06b6d4 50%, var(--teal) 100%);
        }
        .header-wave  { position: absolute; top: -40px; right: -40px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,0.04); }
        .header-wave2 { position: absolute; bottom: -60px; left: 30%; width: 160px; height: 160px; border-radius: 50%; background: rgba(13,148,136,0.15); }
        .company-block { color: var(--white); }
        .company-name  { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; letter-spacing: 0.3px; line-height: 1.2; }
        .company-sub   { font-size: 10px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 2.5px; margin-top: 3px; }
        .company-details { margin-top: 14px; font-size: 11.5px; color: rgba(255,255,255,0.75); line-height: 1.8; }
        .gstin-badge {
            display: inline-block; background: rgba(255,255,255,0.1); color: #5eead4;
            padding: 2px 10px; border-radius: 4px; font-size: 10px; letter-spacing: 1px; margin-top: 4px;
        }
        .invoice-badge { text-align: right; color: var(--white); }
        .invoice-tag   { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #5eead4; text-transform: uppercase; }
        .invoice-num   { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px; letter-spacing: 1px; }
        .invoice-num span { color: var(--white); font-weight: 600; }

        /* STATUS RIBBON */
        .status-ribbon {
            background: var(--silver); border-bottom: 1px solid var(--border);
            padding: 10px 40px; display: flex; justify-content: space-between; align-items: center;
            font-size: 12px; color: var(--slate);
        }
        .status-pill {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 4px 14px; border-radius: 100px; font-weight: 600; font-size: 12px;
            background: ${statusBg}; color: ${statusColor};
        }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: ${statusColor}; }

        /* BODY */
        .body-section { padding: 28px 40px; }
        .parties-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .info-card {
            background: var(--silver); border-radius: 12px; padding: 18px 20px;
            border: 1px solid var(--border); position: relative; overflow: hidden;
        }
        .info-card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
            background: linear-gradient(180deg, var(--teal), var(--teal-dark));
        }
        .info-label  { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--teal); font-weight: 600; margin-bottom: 8px; }
        .info-name   { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
        .info-detail { font-size: 12px; color: var(--slate); line-height: 1.7; }

        /* DATE CHIPS */
        .dates-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        .date-chip  { background: linear-gradient(135deg, var(--teal-light), #f0fdfa); border: 1px solid #99f6e4; border-radius: 10px; padding: 12px 14px; text-align: center; }
        .date-chip-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--teal-dark); font-weight: 600; margin-bottom: 4px; }
        .date-chip-value { font-size: 12.5px; font-weight: 700; color: var(--navy); }

        /* TABLE */
        .table-section  { margin-bottom: 28px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .table-header   { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr; background: linear-gradient(90deg, var(--navy), #1e3a5f); padding: 13px 18px; gap: 8px; }
        .th             { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.65); font-weight: 600; }
        .th:not(:first-child) { text-align: right; }
        .table-row      { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr; padding: 16px 18px; gap: 8px; border-bottom: 1px solid var(--border); background: var(--white); align-items: center; }
        .table-row:last-child { border-bottom: none; }
        .td             { font-size: 13px; color: var(--text); }
        .td:not(:first-child) { text-align: right; font-weight: 600; }
        .service-name   { font-weight: 700; color: var(--navy); font-size: 13.5px; }
        .service-sub    { font-size: 11px; color: var(--slate); margin-top: 2px; }

        /* TOTALS */
        .totals-section { display: grid; grid-template-columns: 1fr 300px; gap: 20px; margin-bottom: 24px; align-items: start; }
        .payment-info   { background: var(--silver); border-radius: 12px; padding: 18px 20px; border: 1px solid var(--border); }
        .payment-info-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--slate); font-weight: 600; margin-bottom: 12px; }
        .payment-row    { display: flex; justify-content: space-between; font-size: 12px; color: var(--slate); margin-bottom: 7px; }
        .payment-row span:last-child { font-weight: 600; color: var(--navy); }
        .totals-box     { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(13,148,136,0.08); }
        .totals-row     { display: flex; justify-content: space-between; padding: 11px 18px; border-bottom: 1px solid var(--border); font-size: 13px; background: var(--white); }
        .totals-row:last-child { border-bottom: none; }
        .totals-row .label { color: var(--slate); }
        .totals-row .value { font-weight: 600; color: var(--navy); }
        .totals-row.highlight { background: linear-gradient(135deg, var(--navy), #1e3a5f); padding: 14px 18px; }
        .totals-row.highlight .label { color: rgba(255,255,255,0.7); }
        .totals-row.highlight .value { color: #5eead4; font-size: 18px; font-weight: 700; font-family: 'Playfair Display', serif; }
        .totals-row.balance-due { background: ${statusBg}; }
        .totals-row.balance-due .label { color: ${statusColor}; font-weight: 500; }
        .totals-row.balance-due .value { color: ${statusColor}; }

        /* PROOF */
        .proof-section { background: var(--silver); border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; border: 1px dashed var(--border); font-size: 12px; color: var(--slate); }
        .proof-section a { color: var(--teal); font-weight: 600; word-break: break-all; }

        /* TERMS */
        .terms-section { margin-bottom: 24px; }
        .terms-title { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 12px; }
        .terms-list { list-style: none; padding: 0; }
        .terms-list li { font-size: 12px; color: var(--slate); line-height: 1.6; margin-bottom: 6px; }
        .terms-list li:before { content: "•"; color: var(--teal); font-weight: bold; margin-right: 8px; }

        /* FOOTER */
        .footer-divider { height: 3px; background: linear-gradient(90deg, var(--teal), #06b6d4, var(--teal)); }
        .invoice-footer { background: linear-gradient(135deg, var(--navy), #1e3a5f); padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
        .footer-brand   { font-family: 'Playfair Display', serif; color: rgba(255,255,255,0.9); font-size: 14px; }
        .footer-note    { font-size: 11px; color: rgba(255,255,255,0.45); text-align: right; line-height: 1.7; }

        @media print {
            body { background: white; }
            .invoice-wrapper { box-shadow: none; margin: 0; max-width: 100%; }
        }
    </style>
</head>
<body>
<div class="invoice-wrapper">

    <div class="letterhead-bg">${bgImg}</div>
    <div class="corner-tl"></div>
    <div class="corner-br"></div>

    <div class="invoice-content">

        <!-- HEADER -->
        <div class="header">
            <div class="header-wave"></div>
            <div class="header-wave2"></div>
            <div class="company-block">
                <div class="company-name">Safehand Lifecare Private Limited</div>
                <div class="company-sub">Healthcare &middot; Wellness &middot; Trust</div>
                <div class="company-details">
                    A-1609 Tower 4, NX One, Greater Noida West, UP 201318<br>
                    &#128222; 0120-6580106 &nbsp;|&nbsp; &#9993; Account@safehandlifecare.com<br>
                    &#127760; www.safehandlifecare.com
                </div>
                <div class="gstin-badge">GSTIN:09ABTCS3294F1ZP&nbsp;|&nbsp; State: 09 &ndash; Uttar Pradesh</div>
            </div>
            <div class="invoice-badge">
                <div class="invoice-tag">Invoice</div>
                <div class="invoice-num">No. <span>#SHL-${invoiceNo}</span></div>
                <div class="invoice-num" style="margin-top:6px">Date: <span>${formatDate(paymentDate || createdAt)}</span></div>
            </div>
        </div>

        <!-- STATUS RIBBON -->
        <div class="status-ribbon">
            <span>Payment Mode: <strong>${capitalize(paymentMethod)}</strong></span>
            <div class="status-pill">
                <div class="status-dot"></div>
                ${capitalize(paymentStatus)}
            </div>
            <span>Invoice Ref: <strong>${invoiceRef}</strong></span>
        </div>

        <!-- BODY -->
        <div class="body-section">

            <!-- Billed To / Service Details -->
            <div class="parties-row">
                <div class="info-card">
                    <div class="info-label">Billed To</div>
                    <div class="info-name">${clientName || 'Client Name'}</div>
                    <div class="info-detail">
                        ${clientPhone ? '&#128241; ' + clientPhone + '<br>' : ''}
                        ${clientAddress || ''}
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-label">Service Details</div>
                    <div class="info-name">${serviceName || 'Healthcare Service'}</div>
                    <div class="info-detail">
                        Payment ID: ${paymentId}<br>
                        Invoice Ref: ${invoiceRef}
                    </div>
                </div>
            </div>

            <!-- Date Chips — client-relevant only -->
            <div class="dates-grid">
                <div class="date-chip">
                    <div class="date-chip-label">Invoice Date</div>
                    <div class="date-chip-value">${formatDate(paymentDate || createdAt)}</div>
                </div>
                <div class="date-chip">
                    <div class="date-chip-label">Service Start</div>
                    <div class="date-chip-value">${formatDate(serviceStartDate)}</div>
                </div>
                <div class="date-chip">
                    <div class="date-chip-label">Paid Until</div>
                    <div class="date-chip-value">${formatDate(paidUntilNow)}</div>
                </div>
                <div class="date-chip">
                    <div class="date-chip-label">Status</div>
                    <div class="date-chip-value" style="color:${statusColor}">${capitalize(paymentStatus)}</div>
                </div>
            </div>

            <!-- Services Table -->
            <div class="table-section">
                <div class="table-header">
                    <div class="th">Description</div>
                    <div class="th">Service Date</div>
                    <div class="th">Payment Mode</div>
                    <div class="th">Amount</div>
                </div>
                <div class="table-row">
                    <div class="td">
                        <div class="service-name">${serviceName || 'Healthcare Service'}</div>
                        <div class="service-sub">Ref: ${invoiceRef}</div>
                    </div>
                    <div class="td">${formatDate(paidFromDate)}</div>
                    <div class="td">${capitalize(paymentMethod)}</div>
                    <div class="td">${formatCurrency(amount)}</div>
                </div>
            </div>

            <!-- Totals -->
            <div class="totals-section">
                <div class="payment-info">
                    <div class="payment-info-title">Payment Summary</div>
                    <div class="payment-row"><span>Invoice Date</span><span>${formatDate(paymentDate || createdAt)}</span></div>
                    <div class="payment-row"><span>Service Start</span><span>${formatDate(serviceStartDate)}</span></div>
                    <div class="payment-row"><span>Payment From</span><span>${formatDate(paidFromDate)}</span></div>
                    <div class="payment-row"><span>Paid Until</span><span>${formatDate(paidUntilNow)}</span></div>
                    <div class="payment-row"><span>Payment Mode</span><span>${capitalize(paymentMethod)}</span></div>
                    <div class="payment-row"><span>Payment Status</span><span style="color:${statusColor}">${capitalize(paymentStatus)}</span></div>
                    <div class="payment-row"><span>GST</span><span>0%</span></div>
                </div>
                <div class="totals-box">
                    <div class="totals-row">
                        <span class="label">Amount</span>
                        <span class="value">${formatCurrency(amount)}</span>
                    </div>
                    <div class="totals-row">
                        <span class="label">GST</span>
                        <span class="value">0%</span>
                    </div>
                    <div class="totals-row balance-due">
                        <span class="label">Balance Due</span>
                        <span class="value">${formatCurrency(remainingAmount)}</span>
                    </div>
                    <div class="totals-row highlight">
                        <span class="label">Total Paid</span>
                        <span class="value">${formatCurrency(amount)}</span>
                    </div>
                </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
                <div class="terms-title">Terms and Conditions</div>
                <ul class="terms-list">
                    <li>Payment received successfully.</li>
                    <li>Service charges are non-refundable.</li>
                    <li>Replacement subject to availability.</li>
                    <li>Extra duty/overtime chargeable separately.</li>
                    <li>Disputes subject to Noida jurisdiction.</li>
                    <li>We appreciate your trust in Safehand Lifecare Private Limited.</li>
                </ul>
            </div>

            ${proofBlock}

        </div>

        <!-- FOOTER -->
        <div class="footer-divider"></div>
        <div class="invoice-footer">
            <div class="footer-brand">Safehand Lifecare Pvt. Ltd.</div>
            <div class="footer-note">
                Thank you for choosing Safehand Lifecare.<br>
                Queries: Account@safehandlifecare.com &nbsp;|&nbsp; 0120-6580106
            </div>
        </div>

    </div>
</div>
</body>
</html>`;
};

module.exports = { generateServiceInvoiceTemplate };
