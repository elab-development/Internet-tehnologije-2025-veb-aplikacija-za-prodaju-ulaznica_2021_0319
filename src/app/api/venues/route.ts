import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @openapi
 * /api/venues:
 *   get:
 *     tags:
 *       - Venues
 *     summary: Get all venues
 *     responses:
 *       200:
 *         description: List of venues
 */
export async function GET() {
    try {
        const venues = await prisma.venue.findMany();
        return NextResponse.json(venues);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching venues', error }, { status: 500 });
    }
}
