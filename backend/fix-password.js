const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
    
    const users = await User.find({})
    console.log(`Found ${users.length} users in database`)
    
    for (const user of users) {
      user.password = 'kacci123'
      await user.save()
      console.log(`  - Updated password for user: ${user.username} (${user.role})`)
    }
    
    console.log('\n✅ All passwords have been reset successfully!')
    console.log('🔑 Password for all users: kacci123')
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

fixPassword()
