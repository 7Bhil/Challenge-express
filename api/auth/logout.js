router.post('/logout', (req, res) => {
  res.clearCookie('token'); // Si tu utilises des cookies
  res.json({ message: 'Logged out successfully' });
});