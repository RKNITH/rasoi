import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define Schema directly in script to avoid "Module Not Found" errors
const tableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, min: 1 },
    floor: { type: String, default: 'Ground' },
    section: String,
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        default: 'available'
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);

const seedTables = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rasoi";

        console.log('Connecting to:', uri);
        await mongoose.connect(uri);

        // Clear existing tables to avoid "Duplicate Key" errors on tableNumber
        await Table.deleteMany({});
        console.log('🗑️ Existing tables cleared.');

        const tables = [];
        const config = [
            { floor: 'Ground', section: 'Main Hall', count: 20, start: 1 },
            { floor: 'Ground', section: 'Garden', count: 10, start: 21 },
            { floor: 'First', section: 'Terrace', count: 12, start: 31 },
            { floor: 'Rooftop', section: 'VIP Lounge', count: 8, start: 43 }
        ];

        config.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                const num = group.start + i;

                // Distribution: tables 1-10 are 2-seaters, others vary
                let capacity = 4;
                if (num <= 10) capacity = 2;
                if (num % 7 === 0) capacity = 6;
                if (group.floor === 'Rooftop') capacity = 8;

                tables.push({
                    tableNumber: num.toString().padStart(2, '0'),
                    capacity,
                    floor: group.floor,
                    section: group.section,
                    status: 'available',
                    isActive: true
                });
            }
        });

        await Table.insertMany(tables);
        console.log(`✅ Success! Seeded ${tables.length} tables for Rasoi.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedTables();