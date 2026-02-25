import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    await User.deleteMany({});

    const users = [
      {
        name: 'Admin User',
        email: 'admin@physio.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isActive: true
      },
      {
        name: 'Doctor User',
        email: 'doctor@physio.com',
        password: await bcrypt.hash('doctor123', 10),
        role: 'doctor',
        isActive: true
      }
    ];

    await User.insertMany(users);
    console.log('Users created successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();