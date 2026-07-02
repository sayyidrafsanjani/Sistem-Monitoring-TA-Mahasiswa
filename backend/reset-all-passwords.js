
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const users = await User.find({});
    console.log('\nTotal', users.length, 'users found\n');

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      user.password = 'password123';
      await user.save();
      console.log('Password for', user.username, '(' + user.role + ') reset to "password123"');
    }

    console.log('\nAll passwords reset successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPasswords();
