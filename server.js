import express from 'express';
import mongoose from 'mongoose';
import Mailjet from 'node-mailjet';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Create the uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// MongoDB connection
mongoose.connect('mongodb://localhost/safestreetApp')
  .then(() => console.log('Connected to MongoDB'));

// User schema
const userSchema = new mongoose.Schema({
  mobile: String,
  email: String,
  name: String,
  role: String,
  createdAt: Date,
  totalUploads: Number,
  otp: String,
  otpExpiry: Date,
  profilePicUrl: String, // Add this
});
const User = mongoose.model('User', userSchema);

// Photo schema
const photoSchema = new mongoose.Schema({
  userEmail: String,
  filePath: String,
  latitude: Number,
  longitude: Number,
  uploadDate: Date,
});
const Photo = mongoose.model('Photo', photoSchema);

// Configure Mailjet
const mailjet = new Mailjet({
  apiKey: '29031520f5e5c4846bb6bb8bdeab5585',
  apiSecret: '967b7f6937e25e33bc5ff2468c430390',
});

const sendEmail = async (email, message) => {
  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'safestreet2025@gmail.com',
              Name: 'SafeStreetApp',
            },
            To: [
              {
                Email: email,
              },
            ],
            Subject: 'Your OTP for SafeStreetApp',
            TextPart: message,
          },
        ],
      });
    console.log(`Email sent to ${email}: ${message}`);
  } catch (error) {
    console.error('Error sending email via Mailjet:', error.message);
    throw error;
  }
};

// /send-otp endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  console.log(`Received /send-otp request for email: ${email}`);

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const message = `Your OTP is ${otp}`;
    await sendEmail(email, message);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in /send-otp:', error.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// /verify-otp endpoint
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  console.log(`Received /verify-otp request for email: ${email}, otp: ${otp}`);

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user);

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const currentTime = new Date();
    if (currentTime > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in /verify-otp:', error.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});
// In server.js
app.post('/api/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  const { email } = req.body;
  if (!req.file || !email) {
    return res.status(400).json({ error: 'Profile picture and email are required' });
  }

  try {
    const profilePicUrl = `/uploads_profile/${req.file.filename}`;
    const user = await User.findOneAndUpdate(
      { email },
      { profilePicUrl },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'Profile picture uploaded', profilePicUrl });
  } catch (error) {
    console.error('Error uploading profile pic:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});
// /upload-photo endpoint
app.post('/api/upload-photo', upload.single('photo'), async (req, res) => {
  console.log('Received /upload-photo request');

  if (!req.file) {
    return res.status(400).json({ error: 'No photo uploaded' });
  }

  const { userEmail, latitude, longitude } = req.body;

  if (!userEmail || !latitude || !longitude) {
    return res.status(400).json({ error: 'User email, latitude, and longitude are required' });
  }

  try {
    const photo = new Photo({
      userEmail,
      filePath: req.file.path,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      uploadDate: new Date(),
    });
    await photo.save();

    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $inc: { totalUploads: 1 } },
      { new: true }
    );

    res.status(200).json({ message: 'Photo uploaded successfully', filePath: req.file.path });
  } catch (error) {
    console.error('Error in /upload-photo:', error.message);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// /get-photos endpoint
app.get('/api/get-photos', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error in /get-photos:', error.message);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// /get-user endpoint
app.get('/api/get-user', async (req, res) => {
  const { email } = req.query;
  console.log(`Received /get-user request for email: ${email}`);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in /get-user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));