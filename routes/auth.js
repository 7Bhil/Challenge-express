// routes/auth.js
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      level: user.level || 1,
      points: user.points || 0,
      streak: user.streak || 0,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// routes/auth.js
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // OPTIONS CORRIGÉES
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    httpOnly: true,
    secure: false, // ← METTRE À false en développement
    sameSite: 'lax' // ← AJOUTER cette ligne
  };

  res.cookie('token', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};