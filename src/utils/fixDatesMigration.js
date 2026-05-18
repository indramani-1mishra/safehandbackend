/**
 * Migration script to fix timezone-shifted dates in JobCard serviceStart
 * Run this once to normalize all existing job cards' service start dates
 */

const JobCard = require("../modals/jobcartModel");
const Enquiry = require("../modals/enqueryModel");

const normalizeDateOnly = (value) => {
    if (!value) return new Date();
    if (typeof value === "string") {
        const datePart = value.split("T")[0];
        const [year, month, day] = datePart.split("-");
        if (year && month && day) {
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
    }
    return new Date(value);
};

const fixJobCardDates = async () => {
    try {
        console.log("🔄 Starting JobCard date normalization...");
        
        const jobCards = await JobCard.find({});
        let fixedCount = 0;
        let errors = 0;

        for (const jobCard of jobCards) {
            try {
                if (jobCard.serviceStart) {
                    const originalDate = new Date(jobCard.serviceStart);
                    const normalizedDate = normalizeDateOnly(jobCard.serviceStart);
                    
                    // Only update if dates are different
                    if (originalDate.getDate() !== normalizedDate.getDate()) {
                        console.log(`  ⚠️  Job ID: ${jobCard._id}`);
                        console.log(`     Original: ${originalDate.toDateString()}`);
                        console.log(`     Normalized: ${normalizedDate.toDateString()}`);
                        
                        await JobCard.findByIdAndUpdate(
                            jobCard._id,
                            { serviceStart: normalizedDate }
                        );
                        fixedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error fixing job card ${jobCard._id}:`, err.message);
                errors++;
            }
        }

        console.log(`\n✅ JobCard Fix Summary:`);
        console.log(`   Fixed: ${fixedCount}`);
        console.log(`   Errors: ${errors}`);
    } catch (error) {
        console.error("Error in fixJobCardDates:", error);
        throw error;
    }
};

const fixEnquiryDates = async () => {
    try {
        console.log("\n🔄 Starting Enquiry date normalization...");
        
        const enquiries = await Enquiry.find({});
        let fixedCount = 0;
        let errors = 0;

        for (const enquiry of enquiries) {
            try {
                if (enquiry.startDate) {
                    const originalDate = new Date(enquiry.startDate);
                    const normalizedDate = normalizeDateOnly(enquiry.startDate);
                    
                    if (originalDate.getDate() !== normalizedDate.getDate()) {
                        console.log(`  ⚠️  Enquiry ID: ${enquiry._id}`);
                        console.log(`     Original: ${originalDate.toDateString()}`);
                        console.log(`     Normalized: ${normalizedDate.toDateString()}`);
                        
                        await Enquiry.findByIdAndUpdate(
                            enquiry._id,
                            { startDate: normalizedDate }
                        );
                        fixedCount++;
                    }
                }
            } catch (err) {
                console.error(`Error fixing enquiry ${enquiry._id}:`, err.message);
                errors++;
            }
        }

        console.log(`\n✅ Enquiry Fix Summary:`);
        console.log(`   Fixed: ${fixedCount}`);
        console.log(`   Errors: ${errors}`);
    } catch (error) {
        console.error("Error in fixEnquiryDates:", error);
        throw error;
    }
};

module.exports = {
    fixJobCardDates,
    fixEnquiryDates,
    normalizeDateOnly
};
