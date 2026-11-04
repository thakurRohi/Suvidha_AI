const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`🔌 Attempting to connect to MongoDB at: ${process.env.MONGODB_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Make sure MongoDB is running locally (mongod) or check your connection string.');
    console.log('\n📝 Quick fixes:');
    console.log('1. Start MongoDB: mongod');
    console.log('2. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    console.log('3. Or switch to MongoDB Atlas by uncommenting the MONGODB_URI in .env\n');
    setTimeout(() => process.exit(1), 1000);
  }
};

module.exports = connectDB;
