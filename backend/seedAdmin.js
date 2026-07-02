const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { MongoMemoryServer } = require('mongodb-memory-server')
const User = require('./models/User')
require('dotenv').config()

const seedAdmin = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring'
    let mongoServer = null
    
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log('MongoDB connected to:', mongoUri)
    } catch (err) {
      console.log('Local MongoDB not available, starting in-memory server...')
      mongoServer = await MongoMemoryServer.create()
      mongoUri = mongoServer.getUri()
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log('In-memory MongoDB connected to:', mongoUri)
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' })
    if (existingAdmin) {
      console.log('Admin already exists!')
      if (mongoServer) await mongoServer.stop()
      process.exit(0)
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await User.create({
      name: 'Administrator',
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    })

    console.log('\n✅ Admin created successfully!')
    console.log('📝 Username: admin')
    console.log('🔑 Password: admin123')
    console.log('⚠️ Please change the password immediately after logging in!\n')
    console.log('⚠️ Important: If using in-memory server, DO NOT close this terminal yet!')
    console.log('   Run server.js in a NEW terminal window while this is still running.\n')

    // Keep process running if using in-memory
    if (mongoServer) {
      console.log('Press Ctrl+C to stop the in-memory server')
    } else {
      process.exit(0)
    }
  } catch (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  }
}

seedAdmin()
