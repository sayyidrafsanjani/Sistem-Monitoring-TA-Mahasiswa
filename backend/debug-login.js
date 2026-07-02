const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
require('dotenv').config()

const debugLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
    
    const user = await User.findOne({ username: 'jusjus' })
    if (!user) {
      console.log('❌ User not found!')
      process.exit(1)
    }
    
    console.log('✅ User found:', user.username)
    console.log('Stored password hash:', user.password)
    
    // Test password match
    const testPassword = 'kacci123'
    const isMatch = await bcrypt.compare(testPassword, user.password)
    
    console.log(`\nTesting password "${testPassword}":`)
    if (isMatch) {
      console.log('✅ Password matches!')
    } else {
      console.log('❌ Password does NOT match!')
      
      // Let's reset the password directly
      console.log('\n🔧 Resetting password to "kacci123"...')
      const hashedPassword = await bcrypt.hash('kacci123', 10)
      user.password = hashedPassword
      await user.save()
      console.log('✅ Password reset successfully!')
      
      // Test again
      const isMatchAfterReset = await bcrypt.compare('kacci123', user.password)
      console.log('After reset, password matches:', isMatchAfterReset)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

debugLogin()
