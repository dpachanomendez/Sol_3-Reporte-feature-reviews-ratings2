export const requireAdmin = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'administrador') {
    return res.status(403).json({ message: 'Solo administradores' });
  }
  next();
};