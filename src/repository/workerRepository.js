const Worker = require("../modals/workerModel");
const Service = require("../modals/serviceModel");



const createWorker = async (data) => {
    const worker = new Worker(data);
    const savedWorker = await worker.save();
    return await savedWorker.populate({ path: 'services', model: Service });
};


const findWorkerByEmail = async (email) => {
    return await Worker.findOne({ email });
};

const findWorkerByPhone = async (phone) => {
    return await Worker.findOne({ phone });
};

const findWorkerById = async (id) => {
    return await Worker.findById(id).populate({ path: 'services', model: Service });
};

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

const checkWorkerBusyStatus = async (id, is12Hour, checkInDate, checkOutDate) => {
    const worker = await Worker.findById(id);
    if (!worker) throw new Error("Worker not found");
    if (is12Hour) {
        // If worker is busy but has no booking slots, they must be busy with a 24h or one-time service
        if (worker.isBusy && worker.workerBookingSlot.length === 0) {
            return true;
        }

        const checkInMins = calculateTotalMinutes(checkInDate);
        const checkOutMins = calculateTotalMinutes(checkOutDate);

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

        const workerBookingSlot = worker.workerBookingSlot || [];
        return workerBookingSlot.some((slot) => {
            return checkOverlap(checkInMins, checkOutMins, slot.from, slot.to);
        });
    }
    return worker.isBusy;
}

const removeWorkerBusySlot = async (id, jobCardId) => {
    const worker = await Worker.findById(id);
    if (!worker) throw new Error("Worker not found");
    
    worker.workerBookingSlot = (worker.workerBookingSlot || []).filter(
        (slot) => slot.jobCardId.toString() !== jobCardId.toString()
    );
    worker.isBusy = worker.workerBookingSlot.length > 0;
    
    return await worker.save();
}

const addworkerBookingSlot = async (id, bookingSlot) => {
    const checkInMins = calculateTotalMinutes(bookingSlot.checkInDate);
    const checkOutMins = calculateTotalMinutes(bookingSlot.checkOutDate);
    return await Worker.findByIdAndUpdate(
        id,
        {
            $push: {
                workerBookingSlot: {
                    from: checkInMins,
                    to: checkOutMins,
                    jobCardId: bookingSlot.safeJobCardId
                }
            },
            isBusy: true
        },
        { returnDocument: 'after', runValidators: true }
    )
}

const updateWorker = async (id, data) => {
    return await Worker.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    ).populate({ path: 'services', model: Service });
};



const deleteWorker = async (id) => {
    return await Worker.findByIdAndDelete(id);
};

const getAllWorkers = async (query = {}) => {
    const { page = 1, limit = 500, search } = query;

    let filter = {};
    if (search) {
        filter = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
                { gender: { $regex: search, $options: "i" } }
            ]
        };
    }

    return await Worker.find(filter)
        .populate({ path: 'services', model: Service })
        .populate({ path: 'adminId', select: 'name' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
};



const getWorkerById = async (id) => {
    const worker = await Worker.findById(id).populate({ path: 'services', model: Service });
    if (!worker) throw new Error("Worker not found");
    return worker;
};



const findFreeWorkers = async () => {
    return await Worker.find({ isBusy: false });
}

const saveRefreshToken = async (id, refreshToken) => {
    return await Worker.findByIdAndUpdate(id, { refreshToken });
}
const removeRefreshToken = async (id) => {
    return await Worker.findByIdAndUpdate(id, { $unset: { refreshToken: "" } });
}
const findWorkerByRefreshToken = async (refreshToken) => {
    return await Worker.findOne({ refreshToken });
}

const workerPopulateOptions = [
    { path: "services", model: Service },
    { path: "adminId", select: "name email" },
];

const findWorkersByAdminId = async (adminId) => {
    return await Worker.find({ adminId })
        .populate(workerPopulateOptions)
        .sort({ createdAt: -1 });
};

const findWorkersByBusyStatus = async (status) => {
    const normalizedStatus = String(status).toLowerCase();
    const isBusy = normalizedStatus === "busy";

    return await Worker.find({ isBusy })
        .populate(workerPopulateOptions)
        .sort({ createdAt: -1 });
};

const findWorkersByDateRange = async (startDate, endDate) => {
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    rangeStart.setUTCHours(0, 0, 0, 0);
    rangeEnd.setUTCHours(23, 59, 59, 999);

    return await Worker.find({
        createdAt: { $gte: rangeStart, $lte: rangeEnd },
    })
        .populate(workerPopulateOptions)
        .sort({ createdAt: -1 });
};

module.exports = {
    createWorker,
    findWorkerByEmail,
    updateWorker,
    deleteWorker,
    getAllWorkers,
    getWorkerById,
    findWorkerById,
    findWorkerByPhone,
    saveRefreshToken,
    removeRefreshToken,
    findWorkerByRefreshToken,
    findFreeWorkers,
    checkWorkerBusyStatus,
    findWorkersByAdminId,
    findWorkersByBusyStatus,
    findWorkersByDateRange,
    removeWorkerBusySlot,
    addworkerBookingSlot
};
