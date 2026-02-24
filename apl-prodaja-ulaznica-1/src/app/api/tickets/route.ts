import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDataFromToken } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get current user's tickets
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of tickets owned by user
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Purchase a ticket
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *             properties:
 *               ticketId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket purchased
 *       404:
 *         description: Ticket not found
 *       409:
 *         description: Ticket already sold
 */
export async function POST(req: NextRequest) {
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Verify user exists in DB (to prevent foreign key errors if user was deleted/reseeded)
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId }
        });
        if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 401 });

        const body = await req.json();
        const { ticketId } = body;

        if (!ticketId) {
            return NextResponse.json({ message: 'Ticket ID required' }, { status: 400 });
        }

        // Find the ticket and ensure it is available (userId is null)
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(ticketId) }
        });

        if (!ticket) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        if (ticket.userId) return NextResponse.json({ message: 'Ticket already sold' }, { status: 409 });

        // Assign ticket to user
        const updatedTicket = await prisma.ticket.update({
            where: { id: parseInt(ticketId) },
            data: {
                userId: user.userId,
                purchasedAt: new Date(),
            },
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("Ticket purchase error:", error);
        return NextResponse.json({ message: 'Error purchasing ticket', error }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const tickets = await prisma.ticket.findMany({
            where: { userId: user.userId },
            include: { event: true },
        });

        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching tickets', error }, { status: 500 });
    }
}
