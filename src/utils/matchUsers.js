const mongoose = require("mongoose");
const workerModel = require("../modals/workerModel");


const matchUsers = async (serviceId, city, is12Hour = false, checkInTime = null, checkOutTime = null) => {
    try {
        console.log(serviceId, city);
        // 🔒 Validation
        if (!serviceId || !city) {
            throw new Error("ServiceId and city are required");
        }

        // ✅ Convert to ObjectId (IMPORTANT)
        const serviceObjectId = new mongoose.Types.ObjectId(serviceId);
        console.log(serviceObjectId);

        // ✅ Clean city (trim + lowercase)
        const cleanCity = city.trim();
        console.log(cleanCity);

        // 🚀 Query
        const query = {
            services: serviceObjectId,
            prefer_city: { $regex: `^${cleanCity}$`, $options: "i" }, // case insensitive
            isActive: true,
            isOnline: true,
        };

        if (!is12Hour) {
            query.isBusy = false;
        }

        const workers = await workerModel.find(query).lean().select(" -refreshToken -createdAt -updatedAt -__v");

        if (is12Hour) {
            const calculateTotalMinutes = (time) => {
                const date = new Date(time);
                if (isNaN(date.getTime())) return 0;
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                const parts = formatter.formatToParts(date);
                const hours = parseInt(parts.find(p => p.type === 'hour').value, 10);
                const minutes = parseInt(parts.find(p => p.type === 'minute').value, 10);
                return hours * 60 + minutes;
            };

            const getIntervals = (from, to) => {
                if (from <= to) {
                    return [{ from, to }];
                } else {
                    return [
                        { from: from, to: 1440 },
                        { from: 0, to: to }
                    ];
                }
            };

            const checkOverlap = (from1, to1, from2, to2) => {
                const intervals1 = getIntervals(from1, to1);
                const intervals2 = getIntervals(from2, to2);
                return intervals1.some(i1 =>
                    intervals2.some(i2 => i1.from < i2.to && i2.from < i1.to)
                );
            };

            const checkInMins = calculateTotalMinutes(checkInTime);
            const checkOutMins = calculateTotalMinutes(checkOutTime);

            return workers.filter(worker => {
                // If they are busy and have no booking slots, they must be busy with a 24h or one-time service
                if (worker.isBusy && (!worker.workerBookingSlot || worker.workerBookingSlot.length === 0)) {
                    return false;
                }
                // Check if any booking slots overlap
                const slots = worker.workerBookingSlot || [];
                const hasOverlap = slots.some(slot => checkOverlap(checkInMins, checkOutMins, slot.from, slot.to));
                return !hasOverlap;
            });
        }

        console.log(workers);
        return workers;

    } catch (error) {
        console.error("Error in matchUsers:", error.message);
        throw error;
    }
};

module.exports = matchUsers;



