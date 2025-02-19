import jwt from 'jsonwebtoken';
import User from '../models/User.model';

// Validar si el token es válido
export const verifyToken = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).json({ message: "No se ha proporcionado ningún Token" });

    try {
        // Extraer la información del token
        const decoded = jwt.verify(token, process.env.SECRET);
        req.userId = decoded.id;
        console.log(decoded);

        // Buscar el usuario en la base de datos
        const user = await User.findById(req.userId, { password: 0 });
        console.log(user);

        // Validar si el usuario existe
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Continuar con la siguiente función si el usuario existe
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};