
const mongoose = require('mongoose');
const User = require('./models/User');
const Thesis = require('./models/Thesis');
const Bimbingan = require('./models/Bimbingan');
const Seminar = require('./models/Seminar');
const Notification = require('./models/Notification');
require('dotenv').config();

async function viewDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected to database:', process.env.MONGO_URI || 'mongodb://localhost:27017/thesis-monitoring');
    console.log('\n' + '================================================================================');

    const users = await User.find({});
    console.log('\nCOLLECTION: users');
    console.log('================================================================================');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log('- _id:', user._id);
      console.log('  Name:', user.name);
      console.log('  Username:', user.username);
      console.log('  Email:', user.email || '-');
      console.log('  Role:', user.role);
      console.log('  NIM:', user.nim || '-');
      console.log('  NIDN:', user.nidn || '-');
      console.log('');
    }

    const theses = await Thesis.find({});
    console.log('\nCOLLECTION: theses');
    console.log('================================================================================');
    for (let i = 0; i < theses.length; i++) {
      const thesis = theses[i];
      console.log('- _id:', thesis._id);
      console.log('  Judul:', thesis.judul);
      console.log('  Mahasiswa:', thesis.mahasiswa);
      console.log('  Pembimbing 1:', thesis.pembimbing1);
      console.log('  Pembimbing 2:', thesis.pembimbing2 || '-');
      console.log('  Status:', thesis.status);
      console.log('');
    }

    const bimbingans = await Bimbingan.find({});
    console.log('\nCOLLECTION: bimbingans');
    console.log('================================================================================');
    for (let i = 0; i < bimbingans.length; i++) {
      const bimbingan = bimbingans[i];
      console.log('- _id:', bimbingan._id);
      console.log('  Thesis ID:', bimbingan.thesis);
      console.log('  Pengirim:', bimbingan.pengirim);
      console.log('  Catatan:', bimbingan.catatan);
      console.log('');
    }

    const seminars = await Seminar.find({});
    console.log('\nCOLLECTION: seminars');
    console.log('================================================================================');
    for (let i = 0; i < seminars.length; i++) {
      const seminar = seminars[i];
      console.log('- _id:', seminar._id);
      console.log('  Thesis ID:', seminar.thesis);
      console.log('  Jenis:', seminar.jenis);
      console.log('  Tanggal:', seminar.tanggal);
      console.log('');
    }

    const notifications = await Notification.find({});
    console.log('\nCOLLECTION: notifications');
    console.log('================================================================================');
    for (let i = 0; i < notifications.length; i++) {
      const notif = notifications[i];
      console.log('- _id:', notif._id);
      console.log('  Penerima:', notif.penerima);
      console.log('  Pesan:', notif.pesan);
      console.log('');
    }

    console.log('\n================================================================================');
    console.log('\nDatabase view completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

viewDatabase();
