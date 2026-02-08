import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getDataFromToken } from '@/lib/auth';

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
