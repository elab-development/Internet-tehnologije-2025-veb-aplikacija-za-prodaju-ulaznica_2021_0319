import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all event categories
 *     responses:
 *       200:
 *         description: List of categories
 */
export async function GET() {
    try {
        const categories = await prisma.category.findMany();
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching categories', error }, { status: 500 });
    }
}
