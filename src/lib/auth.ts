import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: object) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
};

export const getDataFromToken = (req: NextRequest) => {
    try {
        const token = req.headers.get('Authorization')?.split(' ')[1] || req.cookies.get('token')?.value;
        if (!token) return null;
        const decoded = verifyToken(token);
        return decoded as { userId: number; email: string; role: string } | null;
    } catch (error) {
        return null;
    }
};
