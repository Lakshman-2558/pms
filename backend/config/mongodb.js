import mongoose from "mongoose";
import dns from 'node:dns';

// Set default DNS resolution to IPv4 first to avoid look-up issues on some networks
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            const { host, port, name } = mongoose.connection;
            console.log(`✅ Database Connected: ${host}:${port}/${name}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error("❌ Database Connection Error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn("⚠️ Database Disconnected");
        });

        // Prefer full MongoDB connection string (including DB name) from env.
        // Supports both MONGODB_URI (primary) and MONGODB_URL (legacy docs).
        // Falls back to local MongoDB for dev if neither is provided.
        const mongoUri =
            process.env.MONGODB_URI ||
            process.env.MONGODB_URL ||
            "mongodb://localhost:27017/healthsystem";

        console.log("🔄 Attempting to connect to MongoDB...");
        console.log("📍 Connection URI:", mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in logs

        await mongoose.connect(mongoUri, {
            // Increased timeout for better connection stability
            serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 30000, // Connection timeout
            retryWrites: true, // Retry failed writes
            w: 'majority', // Write concern
        });

        console.log("✅ MongoDB connection established successfully");
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);
        console.error("📋 Full error:", error);
        console.error("\n🔍 Troubleshooting tips:");
        console.error("1. Check if your IP address is whitelisted in MongoDB Atlas");
        console.error("2. Verify your MongoDB credentials are correct");
        console.error("3. Ensure your internet connection is stable");
        console.error("4. Check if MongoDB Atlas cluster is running");
    }
}

export default connectDB;

// Do not use '@' symbol in your databse user's password else it will show an error.