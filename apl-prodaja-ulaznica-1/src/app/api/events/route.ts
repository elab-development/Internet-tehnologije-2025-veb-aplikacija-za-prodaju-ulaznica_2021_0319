import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getDataFromToken } from '@/lib/auth';

/**
 * @openapi
 * /api/events:
 *   get:
 *     tags:
 *       - Events
 *     summary: Get all events
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     tags:
 *       - Events
 *     summary: Create a new event (Admin only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - price
 *               - venueId
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *               venueId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event created
 *       403:
 *         description: Unauthorized
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const categoryId = searchParams.get('categoryId');

        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }

        if (categoryId) {
            whereClause.categoryId = parseInt(categoryId);
        }

        const events = await prisma.event.findMany({
            where: whereClause,
            include: {
                venue: true,
                category: true,
            },
        });

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching events', error }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = getDataFromToken(req as unknown as NextRequest); // Cast for compatibility
        // Note: getDataFromToken needs headers/cookies access. 
        // Passing req directly.

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, date, price, venueId, categoryId } = body;

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                price: parseFloat(price),
                venueId: parseInt(venueId),
                categoryId: parseInt(categoryId),
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating event', error }, { status: 500 });
    }
}
