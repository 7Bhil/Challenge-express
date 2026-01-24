const User = require('../models/User');

const initializeSuperadmin = async () => {
    const superadminEmail = '7bhilal.chitou7@gmail.com';
    const superadminPassword = '#Bhildollars';
    const superadminName = 'Superadmin';

    try {
        // Vérifier si le Superadmin existe déjà
        const existingAdmin = await User.findOne({ email: superadminEmail });
        
        if (!existingAdmin) {
            console.log('👷‍♂️ Création du Superadmin automatique...');
            
            const newAdmin = new User({
                name: superadminName,
                email: superadminEmail,
                password: superadminPassword,
                role: 'Superadmin',
                passion: 'DEV_FULLSTACK'
            });

            await newAdmin.save();
            console.log('✅ Superadmin créé avec succès !');
            console.log(`📧 Email: ${superadminEmail}`);
            console.log(`🔐 Password: ${superadminPassword}`);
        } else {
            // S'assurer qu'il a bien le rôle Superadmin s'il existe déjà
            if (existingAdmin.role !== 'Superadmin') {
                existingAdmin.role = 'Superadmin';
                await existingAdmin.save();
                console.log('✅ Rôle du Superadmin mis à jour.');
            }
            console.log('✅ Superadmin prêt.');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du Superadmin:', error.message);
    }
};

module.exports = initializeSuperadmin;
