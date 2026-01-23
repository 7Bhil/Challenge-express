const mongoose = require('mongoose');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Clean Database
        await User.deleteMany({});
        await Challenge.deleteMany({});
        await Submission.deleteMany({});
        console.log('🗑️  Database cleaned');

        // 2. Create Users
        console.log('Creating users...');
        
        // Helper to create user
        const createUser = async (name, email, role, password = 'password123', passion = 'DEV_FULLSTACK') => {
            return await User.create({
                name,
                email,
                password, // Will be hashed by pre-save hook
                role,
                passion,
                level: 1,
                points: role === 'Challenger' ? 50 : 0
            });
        };

        const superAdmin = await createUser('Super Admin', '7bhill@gmail.com', 'Superadmin', 'Bh7777777');
        const admin = await createUser('Admin User', 'admin@seedream.com', 'Admin');
        const jury = await createUser('Jury Member', 'jury@seedream.com', 'Jury');
        const challenger1 = await createUser('Challenger One', 'challenger1@seedream.com', 'Challenger', 'DEV_FRONT');
        const challenger2 = await createUser('Challenger Two', 'challenger2@seedream.com', 'Challenger', 'DEV_BACK');

        console.log('✅ Users created');

        // 3. Create Challenges
        console.log('Creating challenges...');

        const activeChallenge = await Challenge.create({
            title: 'Landing Page Moderne',
            description: 'Créer une landing page pour une startup de tech avec HTML5 et CSS3. Doit être responsive.',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
            difficulty: 'Facile',
            technologies: ['HTML', 'CSS', 'Responsive Design'],
            createdBy: {
                user: admin._id,
                name: admin.name,
                role: admin.role
            },
            status: 'active',
            validationStatus: 'approved',
            validatedBy: superAdmin._id,
            validatedAt: new Date()
        });

        const complexChallenge = await Challenge.create({
            title: 'API E-commerce',
            description: 'Développer une API RESTful pour un site e-commerce avec Node.js et Express. Authentification requise.',
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
            difficulty: 'Difficile',
            technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
            createdBy: {
                user: admin._id,
                name: admin.name,
                role: admin.role
            },
            status: 'active',
            validationStatus: 'approved',
            validatedBy: superAdmin._id,
            validatedAt: new Date()
        });

        const finishedChallenge = await Challenge.create({
            title: 'To-Do List React',
            description: 'Une application de gestion de tâches avec React.',
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // -10 days
            endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // -3 days
            difficulty: 'Moyen',
            technologies: ['React', 'Hooks', 'LocalStorage'],
            createdBy: {
                user: admin._id,
                name: admin.name,
                role: admin.role
            },
            status: 'completed',
            validationStatus: 'approved',
            validatedBy: superAdmin._id,
            validatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
        });

        console.log('✅ Challenges created');

        // 4. Create Submissions
        console.log('Creating submissions...');

        // Challenger 1 submits to Active Challenge (Pending review)
        await Submission.create({
            challenge: activeChallenge._id,
            user: challenger1._id,
            githubUrl: 'https://github.com/challenger1/landing-page',
            liveUrl: 'https://challenger1-landing.netlify.app',
            description: 'Ma solution utilise Flexbox et Grid pour le layout.',
            technologies: ['HTML', 'CSS'],
            status: 'pending'
        });

        // Challenger 2 submits to Active Challenge (Graded)
        const gradedSubmission = await Submission.create({
            challenge: activeChallenge._id,
            user: challenger2._id,
            githubUrl: 'https://github.com/challenger2/landing-page-pro',
            liveUrl: 'https://challenger2-landing.vercel.app',
            description: 'Utilisation de SASS et adoption du BEM.',
            technologies: ['HTML', 'SCSS'],
            status: 'approved',
            scores: [{
                jury: jury._id,
                codeQuality: 18,
                functionality: 19,
                creativity: 15,
                performance: 17,
                documentation: 16,
                comment: 'Excellent travail, code très propre !',
                scoredAt: new Date()
            }]
        });
        
        // Calculate score for the graded submission
        gradedSubmission.calculateFinalScore();
        await gradedSubmission.save();

        console.log('✅ Submissions created');

        console.log('\n🎉 Database Seed Completed Successfully!');
        console.log('----------------------------------------');
        console.log('Credentials (Password: password123):');
        console.log(`🦸 Superadmin: ${superAdmin.email}`);
        console.log(`👮 Admin:      ${admin.email}`);
        console.log(`⚖️  Jury:       ${jury.email}`);
        console.log(`👤 Challenger1:${challenger1.email}`);
        console.log(`👤 Challenger2:${challenger2.email}`);
        console.log('----------------------------------------');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
