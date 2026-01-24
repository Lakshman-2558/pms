import mongoose from "mongoose";
import dns from 'node:dns';

// Set default DNS resolution to IPv4 first to avoid look-up issues on some networks
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            const { host, port, name } = mongoose.connection;
            console.log(`Database Connected: ${host}:${port}/${name}`);
        });
        mongoose.connection.on('error', (err) => console.log("Database Connection Error:", err));

        // Prefer full MongoDB connection string (including DB name) from env.
        // Supports both MONGODB_URI (primary) and MONGODB_URL (legacy docs).
        // Falls back to local MongoDB for dev if neither is provided.
        const mongoUri =
            process.env.MONGODB_URI ||
            process.env.MONGODB_URL ||
            "mongodb://localhost:27017/healthsystem";

        await mongoose.connect(mongoUri, {
            // These options are often helpful for connection stability
            serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
    }
}

export default connectDB;

// Do not use '@' symbol in your databse user's password else it will show an error.