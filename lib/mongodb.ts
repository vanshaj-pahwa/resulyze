import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    console.error("MongoDB URL not found");
    throw new Error("MongoDB URL not found in environment variables");
  }

  if (isConnected) {
    return;
  }

  try {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(process.env.MONGODB_URL, options);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    isConnected = false;
    // Provide more specific error messages
    if (error.message.includes('ETIMEOUT')) {
      throw new Error("Database connection timeout. Please check your internet connection and try again.");
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      throw new Error("SSL/TLS connection error. Please check your MongoDB configuration.");
    } else if (error.message.includes('authentication')) {
      throw new Error("Database authentication failed. Please check your credentials.");
    } else {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
};

// Helper function to check if MongoDB is available
export async function isMongoAvailable(): Promise<boolean> {
  try {
    if (!isConnected) {
      await connectToDB();
    }
    
    // Check connection state (1 = connected)
    const isConnectedState = mongoose.connection.readyState === 1;
    
    // More detailed logging to help troubleshoot
    console.log(`MongoDB connection state: ${mongoose.connection.readyState} (${
      mongoose.connection.readyState === 0 ? 'disconnected' :
      mongoose.connection.readyState === 1 ? 'connected' :
      mongoose.connection.readyState === 2 ? 'connecting' :
      mongoose.connection.readyState === 3 ? 'disconnecting' : 
      'uninitialized'
    })`);
    
    // Perform an additional ping test to verify the connection is actually working
    if (isConnectedState) {
      try {
        // Safely check if db property exists before using it
        const db = mongoose.connection.db;
        if (db) {
          await db.admin().ping();
          console.log('MongoDB ping successful');
          return true;
        } else {
          console.log('MongoDB connection db property is undefined');
          return false;
        }
      } catch (pingError) {
        console.error('MongoDB ping failed:', pingError);
        return false;
      }
    }
    
    // Check for connected state
    return isConnectedState;
  } catch (error) {
    console.error('MongoDB connection check failed:', error);
    return false;
  }
}