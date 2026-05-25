const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({

   adminId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Admin",
      required:true,
      unique:true
   },

   permissions:[
      {
         module:{
            type:String,
            required:true,
            enum:[
               "worker",
               "admin",
               "service",
               "category",
               "enquiry",
               "jobCard",
               "invoice",
               "payment",
               "payout",
               "attendance",
               "client",
               "cart",
               "dashboard",
               "equipment",
               "product",
               "order",
               "checkout",
               "workerLead"
            ]
         },

         actions:[
            {
               type:String,
               enum:[
                  "create",
                  "view",
                  "update",
                  "delete",
                  "approve",
                  "assign"
               ]
            }
         ]
      }
   ]

},{timestamps:true})

module.exports = mongoose.model(
   "Permission",
   permissionSchema
);