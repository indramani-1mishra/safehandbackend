// config/permissions.js

const PERMISSIONS = [

    {
       module: "worker",
       label: "Workers",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "assign"
       ]
    },
 
    {
       module: "admin",
       label: "Admins",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "assign"
       ]
    },
 
    {
       module: "service",
       label: "Services",
 
       actions: [
          "create",
          "view",
          "update",
          "delete"
       ]
    },
 
    {
       module: "category",
       label: "Categories",
 
       actions: [
          "create",
          "view",
          "update",
          "delete"
       ]
    },
 
    {
       module: "enquiry",
       label: "Enquiries",
 
       actions: [
          "view",
          "delete",
          "assign"
       ]
    },
 
    {
       module: "jobCard",
       label: "Job Cards",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "approve"
       ]
    },
 
    {
       module: "invoice",
       label: "Invoices",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "approve",
          "export"
       ]
    },
 
    {
       module: "payment",
       label: "Payments",
 
       actions: [
          "create",
          "view",
          "update",
          "approve"
       ]
    },
 
    {
       module: "payout",
       label: "Payouts",
 
       actions: [
          "create",
          "view",
          "approve"
       ]
    },
 
    {
       module: "attendance",
       label: "Attendance",
 
       actions: [
          "create",
          "view",
          "update",
          "approve"
       ]
    },
 
    {
       module: "client",
       label: "Clients",
 
       actions: [
          "create",
          "view",
          "update",
          "delete"
       ]
    },
 
    {
       module: "cart",
       label: "Cart",
 
       actions: [
          "view",
          "update",
          "delete"
       ]
    },
 
    {
       module: "dashboard",
       label: "Dashboard",
 
       actions: [
          "view"
       ]
    },
 
    {
       module: "equipment",
       label: "Equipment",
 
       actions: [
          "create",
          "view",
          "update",
          "delete"
       ]
    },
 
    {
       module: "product",
       label: "Products",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "export"
       ]
    },
 
    {
       module: "order",
       label: "Orders",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "approve"
       ]
    },
 
    {
       module: "checkout",
       label: "Checkout",
 
       actions: [
          "create",
          "view"
       ]
    },
 
    {
       module: "workerLead",
       label: "Worker Leads",
 
       actions: [
          "create",
          "view",
          "update",
          "delete",
          "assign"
       ]
    }
 
 ];
 
 
 
 // ===============================
 // ALL MODULES ARRAY
 // ===============================
 
 const MODULES = PERMISSIONS.map(
    item => item.module
 );
 
 
 
 // ===============================
 // ALL ACTIONS ARRAY
 // ===============================
 
 const ACTIONS = [
    "create",
    "view",
    "update",
    "delete",
    "approve",
    "assign",
    "export"
 ];
 
 
 
 module.exports = {
    PERMISSIONS,
    MODULES,
    ACTIONS
 };