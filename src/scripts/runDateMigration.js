/**
 * Run this file to fix all timezone-shifted dates in the database:
 * 
 * node src/scripts/runDateMigration.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { fixJobCardDates, fixEnquiryDates } = require('../utils/fixDatesMigration');

const runMigration = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/safehand';
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Run the migrations
        await fixJobCardDates();
        await fixEnquiryDates();

        console.log('\n✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

runMigration();
