import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDataFromToken } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(id) },
            include: {
                venue: true,
                category: true,
                tickets: true
            },
        });

        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });

        const ticketsSold = event.tickets.filter((t: { status: string }) => t.status === 'VALID').length;
        const capacity = event.venue.capacity;
        const available = capacity - ticketsSold;

        return NextResponse.json({
            ...event,
            ticketsSold,
            availableTickets: available,
            isSoldOut: available <= 0
        });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching event', error }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const user = getDataFromToken(req);
        if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

        const body = await req.json();
        const event = await prisma.event.update({
            where: { id: parseInt(id) },
            data: body,
        });

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating event', error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const user = getDataFromToken(req);
        if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

        await prisma.event.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting event', error }, { status: 500 });
    }
}
