
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const venues = await prisma.venue.findMany();
        return NextResponse.json(venues);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching venues', error }, { status: 500 });
    }
}
