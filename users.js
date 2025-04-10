import mongoose from 'mongoose';

// MongoDB connection string (match your server configuration)
const MONGODB_URI = 'mongodb://localhost/safestreetApp';

// Define the User schema
const userSchema = new mongoose.Schema({
  email: String,
  mobile: String,
  name: String,
  role: String,
  createdAt: Date,
  totalUploads: Number,
  otp: String,
  otpExpiry: Date,
  profilePicUrl: String,
});

const User = mongoose.model('User', userSchema);

// Array of user details to insert
const usersToInsert = [
  {
    email: 'damerasanthosh2005@gmail.com',
    mobile: '7330985017',
    name: 'Santhosh',
    role: 'user',
    createdAt: new Date('2025-04-10T00:00:00Z'),
    totalUploads: 0,
    otp: null,
    otpExpiry: null,
    profilePicUrl: '',
  },
  {
    email: 'saiganeshsaga1706@gmail.com',
    mobile: '8688129380',
    name: 'Ganesh',
    role: 'user',
    createdAt: new Date('2025-04-10T00:00:00Z'),
    totalUploads: 0,
    otp: null,
    otpExpiry: null,
    profilePicUrl: '',
  },
  {
    email: 'manikada306@gmail.com',
    mobile: '9133828047',
    name: 'Manikanta',
    role: 'user',
    createdAt: new Date('2025-04-10T00:00:00Z'),
    totalUploads: 0,
    otp: null,
    otpExpiry: null,
    profilePicUrl: '',
  },
  {
    email: 'shivaprasadreddyerri@gmail.com',
    mobile: '9666892362',
    name: 'Shiva',
    role: 'user',
    createdAt: new Date('2025-04-10T00:00:00Z'),
    totalUploads: 0,
    otp: null,
    otpExpiry: null,
    profilePicUrl: '',
  },
  {
    email: 'omkargonnela@mail.com',
    mobile: '9347589519',
    name: 'Omkar',
    role: 'user',
    createdAt: new Date('2025-04-10T00:00:00Z'),
    totalUploads: 0,
    otp: null,
    otpExpiry: null,
    profilePicUrl: '',
  },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Insert or skip existing users
    for (const userData of usersToInsert) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Inserted user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('User seeding completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error.stack);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seeding function
seedUsers();