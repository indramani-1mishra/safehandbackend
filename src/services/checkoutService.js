const Cart = require("../modals/cartmodel");
const Enquiry = require("../modals/enqueryModel");
const JobCard = require("../modals/jobcartModel");
const EquipmentOrder = require("../modals/EquipmentOrder");
const Service = require("../modals/serviceModel");
const ProductOrder = require("../modals/ProductOrder");

const processCheckoutService = async (userId, checkoutData) => {
    try {
        const {
            paymentId,
            shippingAddress,
            city,
            contactNumber,
            pincode,
            servicesData,
            equipmentsData
        } = checkoutData;

        // 1. Fetch Cart
        const cart = await Cart.findOne({ userId })
            .populate("items.serviceId")
            .populate("equipments.equipmentId")
            .populate("products.productId");
        if (!cart) {
            throw new Error("Cart not found");
        }

        if (cart.items.length === 0 && cart.equipments.length === 0) {
            throw new Error("Cart is empty");
        }

        const generatedJobCards = [];
        const generatedEquipmentOrders = [];

        // 2. Process Services
        for (const item of cart.items) {
            const serviceObj = item.serviceId;
            const serviceIdStr = serviceObj._id.toString();

            // Match dynamic data passed from frontend for this specific service
            const data = servicesData && servicesData[serviceIdStr] ? servicesData[serviceIdStr] : null;

            if (!data) {
                throw new Error(`Checkout data missing for service: ${serviceObj.name}`);
            }

            // Create an Auto-Approved Enquiry (Required by architecture)
            const newEnquiry = await Enquiry.create({
                enquiryType: "serviceEnquery",
                name: data.patientDetails?.name || "Patient",
                email: "checkout@app.com",
                phone: data.patientDetails?.phone || contactNumber,
                city: data.patientDetails?.city || city,
                address: data.patientDetails?.address || shippingAddress,
                landmark: data.patientDetails?.landmark,
                pincode: data.patientDetails?.pincode,
                patientName: data.patientDetails?.name,
                age: data.patientDetails?.age || 0,
                gender: data.patientDetails?.gender || "male",
                alternateNumber: data.patientDetails?.alternateNumber,
                startDate: data.serviceStart,
                prefreredReligion: data.prefreredReligion,
                preferredShift: data.preferredShift,
                requestedSkills: data.requestedSkills || [],
                instruction: data.instruction,
                description: data.description,
                message: data.instruction || "Auto-generated from Unified Checkout",
                service: serviceObj._id,
                serviceName: serviceObj.name,
                enquiryFor: data.enquiryFor || "Self",
                serviceDuration: data.serviceDuration || 30,
                packageType: data.serviceDetails?.plan || "basic",
                status: "approved"
            });

            // Create the JobCard automatically
            const newJobCard = await JobCard.create({
                inquiryId: newEnquiry._id,
                patientDetails: {
                    name: data.patientDetails?.name || "Patient",
                    age: data.patientDetails?.age || 0,
                    gender: data.patientDetails?.gender || "male",
                    address: data.patientDetails?.address || shippingAddress,
                    landmark: data.patientDetails?.landmark || "",
                    city: data.patientDetails?.city || city,
                    pincode: data.patientDetails?.pincode || pincode,
                    phone: data.patientDetails?.phone || contactNumber,
                    alternateNumber: data.patientDetails?.alternateNumber || ""
                },
                serviceDetails: {
                    service: serviceObj._id,
                    plan: data.serviceDetails?.plan || "basic",
                    timing: data.serviceDetails?.timing || "12hr"
                },
                serviceStart: data.serviceStart || new Date(),
                prefreredReligion: data.prefreredReligion || "",
                preferredShift: data.serviceDetails?.timing === "12hr" ? (data.preferredShift || "") : "",
                requestedSkills: data.requestedSkills || [],
                instruction: data.instruction || "",
                patientDescription: data.description || "",
                perDayCustomerCost: data.perDayCustomerCost || 0,
                customerPaymentCycleDays: data.customerPaymentCycleDays || 30,
                perDayNurseCost: 0,
                nursePaymentCycleDays: 30,
                status: "pending",
                isAssigned: false
            });

            generatedJobCards.push(newJobCard);
        }

        // 3. Process Equipments
        for (const eqItem of cart.equipments) {
            const equipmentObj = eqItem.equipmentId;
            const equipmentIdStr = equipmentObj._id.toString();

            const eqData = equipmentsData && equipmentsData[equipmentIdStr] ? equipmentsData[equipmentIdStr] : {};

            const newEqOrder = await EquipmentOrder.create({
                userId: userId,
                equipmentId: equipmentObj._id,
                orderType: eqItem.orderType,
                bookingAmountPaid: eqData.bookingAmountPaid || 500,
                status: "pending",
                shippingAddress: shippingAddress,
                city: city,
                contactNumber: contactNumber,
                paymentId: paymentId || ""
            });

            generatedEquipmentOrders.push(newEqOrder);
        }

        // 4. Process Products
        const generatedProductOrders = [];
        for (const pItem of cart.products) {
            const productObj = pItem.productId;
            const productIdStr = productObj._id.toString();

            // Product requires FULL AMOUNT paid. We take it from productsData or default to price * qty
            const pData = checkoutData.productsData && checkoutData.productsData[productIdStr] ? checkoutData.productsData[productIdStr] : {};

            if (productObj.availableQuantity < pItem.quantity) {
                throw new Error(`Out of Stock! Only ${productObj.availableQuantity} items available for ${productObj.name}.`);
            }

            // Deduct inventory
            productObj.availableQuantity -= pItem.quantity;
            await productObj.save();

            const totalPrice = productObj.price * pItem.quantity;
            const newProductOrder = await ProductOrder.create({
                userId: userId,
                productId: productObj._id,
                quantity: pItem.quantity,
                totalPrice: totalPrice,
                status: "pending",
                shippingAddress: shippingAddress,
                city: city,
                contactNumber: contactNumber,
                paymentId: paymentId || ""
            });

            generatedProductOrders.push(newProductOrder);
        }

        // 5. Empty the Cart completely
        cart.items = [];
        cart.equipments = [];
        cart.products = [];
        await cart.save();

        return {
            success: true,
            jobCards: generatedJobCards,
            equipmentOrders: generatedEquipmentOrders,
            productOrders: generatedProductOrders
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    processCheckoutService
};
