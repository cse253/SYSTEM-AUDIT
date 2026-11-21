require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const demoUsers = [
  {
    name: 'Senthil Kumar (Salesman)',
    email: 'salesman@nitfood.com',
    password: 'Password@123',
    role: 'salesman',
    phone: '+91 98421 11001',
    isActive: true,
  },
  {
    name: 'Ramesh Sundaram (Admin)',
    email: 'admin@nitfood.com',
    password: 'Password@123',
    role: 'admin',
    phone: '+91 98421 22002',
    isActive: true,
  },
  {
    name: 'Murugan Palani (Production Supervisor)',
    email: 'supervisor@nitfood.com',
    password: 'Password@123',
    role: 'production_supervisor',
    phone: '+91 98421 33003',
    isActive: true,
  },
  {
    name: 'Anand Natarajan (Accountant / Auditor)',
    email: 'auditor@nitfood.com',
    password: 'Password@123',
    role: 'accountant_auditor',
    phone: '+91 98421 44004',
    isActive: true,
  },
  {
    name: 'K. Balasubramanian (Owner / MD)',
    email: 'owner@nitfood.com',
    password: 'Password@123',
    role: 'owner',
    phone: '+91 98421 55005',
    isActive: true,
  },
];

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nit_food_erp';
    await mongoose.connect(mongoUri);
    console.log(`[Seed Users] Connected to MongoDB at ${mongoUri}`);

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        existing.name = userData.name;
        existing.role = userData.role;
        existing.phone = userData.phone;
        existing.password = userData.password; // Triggers pre-save hash
        existing.isActive = true;
        await existing.save();
        console.log(`[Seed Users] Updated existing user: ${userData.email} (${userData.role})`);
      } else {
        await User.create(userData);
        console.log(`[Seed Users] Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('[Seed Users] Successfully seeded all 5 standard role users!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Users Error]', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
