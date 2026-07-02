const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB (use in-memory if local fails)
async function connectDB() {
  let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected to:', mongoUri);
  } catch (err) {
    console.log('Local MongoDB not available, starting in-memory server...');
    // Start in-memory MongoDB
    const mongoServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoServer.getUri();
    await mongoose.connect(inMemoryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('In-memory MongoDB connected to:', inMemoryUri);
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
