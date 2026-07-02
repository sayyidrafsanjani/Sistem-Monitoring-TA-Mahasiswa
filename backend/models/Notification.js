const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thesis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thesis'
  },
  bimbingan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bimbingan'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['bimbingan_new', 'bimbingan_status'],
    default: 'bimbingan_new'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
