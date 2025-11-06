import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Role } from '../auth/role.entity';
import * as fs from 'fs';
const initSqlJs = require('sql.js');

async function createTestUser() {
  const SQL = await initSqlJs();
  const filebuffer = fs.existsSync('travel-management.sqlite')
    ? fs.readFileSync('travel-management.sqlite')
    : undefined;

  const AppDataSource = new DataSource({
    type: 'sqljs',
    database: filebuffer ? new SQL.Database(filebuffer) : new SQL.Database(),
    autoSave: true,
    location: 'travel-management.sqlite',
    entities: [User, Role],
    synchronize: true,
  });

  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);

    // Create or get the 'user' role
    let userRole = await roleRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      userRole = roleRepository.create({ name: 'user' });
      await roleRepository.save(userRole);
      console.log('Created "user" role');
    }

    // Check if test user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('\n✅ Test user already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    test@example.com');
      console.log('🔑 Password: password123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      await AppDataSource.destroy();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = userRepository.create({
      email: 'test@example.com',
      phone: '+1234567890',
      password: hashedPassword,
      role: userRole,
    });

    await userRepository.save(testUser);

    console.log('\n✅ Test user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    test@example.com');
    console.log('🔑 Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
