import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB Connected !!")
  } catch (error) {

    process.exit(1);
  }
};

export default connectDB; 