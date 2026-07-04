const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();

// Setup CORS untuk Vercel
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3002',
  // Izinkan semua subdomain Vercel
  /\.vercel\.app$/
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Folder uploads (catatan: Vercel tidak menyediakan persistent storage untuk uploads)
const uploadsDir = path.join(__dirname, '../backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect ke MongoDB
let dbConnected = false;

async function connectDB() {
  if (dbConnected) return;
  
  let mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI tidak ditemukan di environment variables!');
    return;
  }
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    dbConnected = true;
    console.log('MongoDB connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

// Seed admin
async function seedAdmin() {
  try {
    const User = require('../backend/models/User');
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
      console.log('Admin user created!');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

// Setup routes
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/thesis', require('../backend/routes/thesis'));
app.use('/api/bimbingan', require('../backend/routes/bimbingan'));
app.use('/api/seminar', require('../backend/routes/seminar'));
app.use('/api/notifications', require('../backend/routes/notifications'));

// Vercel handler
module.exports = async (req, res) => {
  await connectDB();
  await seedAdmin();
  return app(req, res);
};
