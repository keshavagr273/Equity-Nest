import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    await connect(process.env.DB as string);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('💡 Make sure your IP is whitelisted in MongoDB Atlas or use a local MongoDB instance');
    process.exit(1);
  }
};

export default connectDB;
