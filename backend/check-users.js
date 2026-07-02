const mongoose = require('mongoose')
const User = require('./models/User')
require('dotenv').config()

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')
    
    const users = await User.find({})
    console.log('\n📋 All users in database:')
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Name: ${user.name}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Email: ${user.email || '-'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   NIM: ${user.nim || '-'}`)
      console.log(`   NIDN: ${user.nidn || '-'}`)
    })
    
    console.log(`\n✅ Total ${users.length} user(s) found\n`)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkUsers()
