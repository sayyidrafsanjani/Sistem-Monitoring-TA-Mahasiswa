const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
require('dotenv').config()

const resetAndCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
    
    // Delete all users
    await User.deleteMany({})
    console.log('✅ All users deleted')
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('kacci123', 10)
    const admin = await User.create({
      name: 'Administrator',
      username: 'jusjus',
      email: 'jusjus@example.com',
      password: hashedPassword,
      role: 'admin'
    })
    
    console.log('\n✅ Admin user created successfully!')
    console.log('📝 Username: jusjus')
    console.log('🔑 Password: kacci123')
    console.log('⚠️ Please change the password immediately after logging in!\n')
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

resetAndCreateAdmin()
