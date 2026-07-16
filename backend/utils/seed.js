// utils/seed.js — populates the database with starter data so the site
// isn't empty the first time you open it.
// Run it with:  npm run seed

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Service, Project, Job, Product } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // 1) Create a default admin account (change this password after first login!)
    const adminEmail = 'admin@blaisetech.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@12345', 10);
      await User.create({
        fullName: 'Blaisetech Admin',
        email: adminEmail,
        phone: '08000000000',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Default admin created -> email: admin@blaisetech.com | password: Admin@12345');
    }

    // 2) Starter services
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      await Service.bulkCreate([
        { name: 'Electrical Installation', category: 'Installation', basePrice: 25000, description: 'New wiring and electrical installation for homes and offices.' },
        { name: 'Solar Energy System Setup', category: 'Solar', basePrice: 150000, description: 'Supply and installation of solar panels, inverters and batteries.' },
        { name: 'Electrical Maintenance', category: 'Maintenance', basePrice: 10000, description: 'Routine checks and maintenance of electrical systems.' },
        { name: 'Fault Troubleshooting', category: 'Repair', basePrice: 8000, description: 'Diagnosis and repair of electrical faults.' },
        { name: 'Consultation Service', category: 'Consultation', basePrice: 5000, description: 'Professional electrical engineering advice.' },
      ]);
      console.log('✅ Starter services created.');
    }

    // 3) Starter portfolio project
    const projectCount = await Project.count();
    if (projectCount === 0) {
      await Project.create({
        title: 'Residential Solar Installation - Amechi',
        description: 'Full solar power backup system installed for a residential client.',
        clientName: 'Private Client',
        completedDate: '2025-11-10',
      });
      console.log('✅ Sample portfolio project created.');
    }

    // 4) Starter job listing
    const jobCount = await Job.count();
    if (jobCount === 0) {
      await Job.create({
        title: 'Field Electrical Technician',
        description: 'We are looking for an experienced electrical technician to join our field team.',
        location: 'Enugu, Nigeria',
        employmentType: 'Full-time',
      });
      console.log('✅ Sample job listing created.');
    }

    // 5) Starter inventory products
    const productCount = await Product.count();
    if (productCount === 0) {
      await Product.bulkCreate([
        { name: '2.5mm Twin & Earth Cable (100m roll)', category: 'Cables', price: 45000, stockQuantity: 20, description: 'Standard PVC insulated cable for domestic wiring.' },
        { name: '13A Single Switch Socket', category: 'Switches & Sockets', price: 3500, stockQuantity: 50, description: 'Wall-mounted single switched socket outlet.' },
        { name: '450W Monocrystalline Solar Panel', category: 'Solar', price: 120000, stockQuantity: 10, description: 'High-efficiency solar panel for residential systems.' },
        { name: '1.5KVA Pure Sine Wave Inverter', category: 'Solar', price: 180000, stockQuantity: 8, description: 'Reliable inverter for small home backup systems.' },
        { name: 'Circuit Breaker (32A)', category: 'Protection', price: 4500, stockQuantity: 30, description: 'Miniature circuit breaker for overload protection.' },
      ]);
      console.log('✅ Starter inventory products created.');
    }

    console.log('🎉 Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
