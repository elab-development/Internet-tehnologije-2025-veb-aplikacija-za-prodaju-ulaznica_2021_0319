import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getDataFromToken } from '@/lib/auth';

/**
 * @openapi
 * /api/tickets/{id}:
 *   patch:
 *     tags:
 *       - Tickets
 *     summary: Exchange a ticket for another
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Old ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newTicketId
 *             properties:
 *               newTicketId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket exchanged successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 *   delete:
 *     tags:
 *       - Tickets
 *     summary: Cancel a ticket
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket cancelled
 *       403:
 *         description: Forbidden
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const ticketId = parseInt(id);

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });

        if (ticket.userId !== user.userId && user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await prisma.ticket.delete({
            where: { id: ticketId }
        });

        return NextResponse.json({ message: 'Ticket cancelled' });
    } catch (error) {
        return NextResponse.json({ message: 'Error cancelling ticket', error }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { newTicketId } = body; // User sends the new ticket ID they want
        const oldTicketId = parseInt(id);

        if (!newTicketId) {
            return NextResponse.json({ message: 'New Ticket ID required' }, { status: 400 });
        }

        // 1. Verify ownership of the old ticket
        const oldTicket = await prisma.ticket.findUnique({
            where: { id: oldTicketId },
        });

        if (!oldTicket) return NextResponse.json({ message: 'Old ticket not found' }, { status: 404 });
        if (oldTicket.userId !== user.userId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        // 2. Verify availability of the new ticket
        const newTicket = await prisma.ticket.findUnique({
            where: { id: parseInt(newTicketId) },
        });

        if (!newTicket) return NextResponse.json({ message: 'New ticket not found' }, { status: 404 });
        if (newTicket.status !== 'VALID') return NextResponse.json({ message: 'New ticket is not valid' }, { status: 400 });
        if (newTicket.userId) return NextResponse.json({ message: 'New ticket is already sold' }, { status: 409 });

        // 3. Perform the swap transaction
        // Reset old ticket (release it)
        // Assign new ticket to user
        const result = await prisma.$transaction([
            prisma.ticket.update({
                where: { id: oldTicketId },
                data: {
                    userId: null,
                    purchasedAt: new Date(0) // Reset to epoch
                }
            }),
            prisma.ticket.update({
                where: { id: newTicket.id },
                data: {
                    userId: user.userId,
                    purchasedAt: new Date()
                }
            })
        ]);

        return NextResponse.json({ message: 'Ticket exchanged successfully', newTicket: result[1] });
    } catch (error) {
        console.error("Ticket exchange error:", error);
        return NextResponse.json({ message: 'Error updating ticket', error }, { status: 500 });
    }
}
