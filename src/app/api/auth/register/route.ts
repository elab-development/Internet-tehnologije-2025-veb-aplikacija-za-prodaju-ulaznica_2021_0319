import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name, username, phoneNumber } = body;

        if (!email || !password || !username) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                phoneNumber,
                password: hashedPassword,
                name,
            },
        });

        const token = generateToken({ userId: user.id, email: user.email, role: user.role });

        // In a real app, set cookie. Here returning token JSON for simplicity/homework requirements usually.
        // We can also set a cookie header.
        const response = NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });

        // Setting cookie for easier frontend handling if we want
        response.cookies.set('token', token, { httpOnly: true, path: '/' });

        return response;
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}
