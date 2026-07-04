const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Setup CORS untuk production (izinkan domain frontend Anda)
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3002',
  // Tambahkan domain Vercel Anda nanti, misalnya:
  // 'https://sistem-monitoring-ta.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Setup folder uploads (pastikan ada di production)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB (gunakan Atlas di production)
async function connectDB() {
  let mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    mongoUri = 'mongodb://localhost:27017/thesis-monitoring';
  }
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected to:', mongoUri);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Hapus in-memory server untuk production
    process.exit(1);
  }
}

// Seed admin user if not exists
async function seedAdmin() {
  try {
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ username: 'jusjus' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('kacci123', 10);
      await User.create({
        name: 'Administrator',
        username: 'jusjus',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('\n✅ Admin user created!');
      console.log('📝 Username: jusjus');
      console.log('🔑 Password: kacci123');
      console.log('⚠️ Please change the password immediately after logging in!\n');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

// Initialize everything
async function init() {
  await connectDB();
  await seedAdmin();
  
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/thesis', require('./routes/thesis'));
  app.use('/api/bimbingan', require('./routes/bimbingan'));
  app.use('/api/seminar', require('./routes/seminar'));
  app.use('/api/notifications', require('./routes/notifications'));
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

init();
