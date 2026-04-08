const generateWorkerPdfTemplate = (jobcart, worker, client) => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Job Card - ${jobcart.patientName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: #f4f4f4;
        }
        .container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 20mm;
            box-sizing: border-box;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 14px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            background: #007bff;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .info-item {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        .info-item label {
            display: block;
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
            font-size: 12px;
        }
        .info-item span {
            color: #333;
            font-size: 14px;
        }
        .full-width {
            grid-column: 1 / -1;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SafeHand</h1>
            <p>Your Trusted Healthcare Partner</p>
        </div>

        <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <label>Patient Name</label>
                    <span>${jobcart.patientName}</span>
                </div>
                <div class="info-item">
                    <label>Age / Gender</label>
                    <span>${jobcart.age} / ${jobcart.gender}</span>
                </div>
                <div class="info-item">
                    <label>Contact Number</label>
                    <span>${jobcart.contactNumber}</span>
                </div>
                <div class="info-item">
                    <label>Email Address</label>
                    <span>${jobcart.email || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Service Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <label>Service Required</label>
                    <span>${jobcart.serviceName}</span>
                </div>
                <div class="info-item">
                    <label>Service Category</label>
                    <span>${jobcart.serviceCategory}</span>
                </div>
                <div class="info-item full-width">
                    <label>Service Description</label>
                    <span>${jobcart.serviceDescription || 'No description provided'}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Location Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <label>City</label>
                    <span>${jobcart.city}</span>
                </div>
                <div class="info-item">
                    <label>Pincode</label>
                    <span>${jobcart.pincode}</span>
                </div>
                <div class="info-item full-width">
                    <label>Address</label>
                    <span>${jobcart.address || 'N/A'}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Job Details</div>
            <div class="info-grid">
                <div class="info-item">
                    <label>Job ID</label>
                    <span>${jobcart._id}</span>
                </div>
                <div class="info-item">
                    <label>Job Status</label>
                    <span style="color: #28a745; font-weight: bold;">${jobcart.status}</span>
                </div>
                <div class="info-item">
                    <label>Assigned Worker</label>
                    <span>${jobcart.assignedWorker ? jobcart.assignedWorker.name : 'Not yet assigned'}</span>
                </div>
                <div class="info-item">
                    <label>Assigned Date</label>
                    <span>${jobcart.assignedDate ? new Date(jobcart.assignedDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="info-item full-width">
                    <label>Special Instructions</label>
                    <span>${jobcart.specialInstructions || 'None'}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>This is an automatically generated job card</p>
            <p>Please contact SafeHand support for any queries</p>
        </div>
    </div>
</body>
</html>
    `
}