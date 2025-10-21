const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, minLength: 3 },            // nom de l'utilisateur
  email: { type: String, required: true, trim: true, lowercase: true, unique: true }, // email unique
  password: { type: String, required: true },        // mot de passe (haché)
  role: {                                            // rôle du user
    type: String,
    enum: ["Superadmin", "Admin", "Jury", "Challenger"],
    default: "Challenger"
  },
  passion: {
        type: String,
        enum: ['DEV_FRONT', 'DEV_BACK', 'DEV_FULLSTACK', 'DEV_MOBILE'],
        default: 'DEV_FRONT'
    },
  noteGeneral: { type: Number, default: 0 },         // note globale
  notePrecedente: { type: Number, default: 0 },      // note précédente
  createdAt: { type: Date, default: Date.now },      // date d'inscription
  // Dans models/User.js, ajoute :
level: { type: Number, default: 1 },
points: { type: Number, default: 0 },
streak: { type: Number, default: 0 },
avatar: { 
  type: String, 
  default: "https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous" 
}
});
userSchema.pre('save', async function(next) {
    // 1. On vérifie si le mot de passe a été modifié ou s'il est nouveau
    if (!this.isModified('password')) {
        return next();
    }
    
    // 2. Le mot de passe haché DOIT être créé ici
    try {
        const salt = await bcrypt.genSalt(10);
        // Le résultat du hachage est stocké directement dans le champ du document (this.password)
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        // En cas d'erreur de hachage, arrêter la sauvegarde
        next(err); 
    }
});
module.exports = mongoose.model("User", userSchema);
