// ============================================
// IMPORT DES MODULES
// ============================================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const Challenge = require('./models/Challenge');
const Message = require('./models/Message');
const initializeSuperadmin = require('./utils/adminInitializer');

const messageRoutes = require('./routes/messageRoutes'); // Import message routes

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// ============================================
// CONFIGURATION CORS
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'https://challenge-react-delta.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (comme les apps mobiles ou curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));
// ============================================
// MIDDLEWARES
// ============================================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
// ============================================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const challengeRoutes = require('./routes/challengeRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);


// ============================================
// SOCKET.IO CONFIGURATION
// ============================================
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});


// ... (existing code)


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', async (data) => {
    // data = { room, author, authorId, message, time, role, avatar }
    
    // Save to MongoDB
    try {
      const newMessage = new Message({
        room: data.room,
        author: data.author,
        authorId: data.authorId,
        role: data.role,
        message: data.message,
        avatar: data.avatar,
        time: data.time
      });
      await newMessage.save();
      
      // Emit to room
      io.to(data.room).emit('receive_message', data);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ============================================
// CONNEXION MONGODB + DÉMARRAGE SERVEUR
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connecté");

    // Initialiser le Superadmin
    await initializeSuperadmin();

    // Lancer le serveur (via server.listen et non app.listen pour Socket.io)
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🌐 CORS activé pour ${process.env.REACT_APP_API_URL}`);
      console.log(`🔌 Socket.io prêt`);

      // 🔄 Keep-alive pour Render (évite que le backend s'endorme)
      const RELOAD_URL = "https://challenge-express.onrender.com/api/auth/ping";
      const https = require("https");
      
      setInterval(() => {
        https.get(RELOAD_URL, (res) => {
          console.log(`📡 Keep-alive: Status ${res.statusCode}`);
        }).on('error', (err) => {
          console.error("❌ Keep-alive error:", err.message);
        });
      }, 14 * 60 * 1000); // Toutes les 14 minutes
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
  });
