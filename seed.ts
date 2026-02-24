import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Cleanup
    await prisma.ticket.deleteMany()
    await prisma.event.deleteMany()
    await prisma.venue.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await bcrypt.hash('admin123', 10)
    const userPasswordHash = await bcrypt.hash('user123', 10)

    // Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            username: 'admin',
            password: passwordHash,
            name: 'Admin User',
            role: 'ADMIN',
            phoneNumber: '1234567890'
        }
    })

    const user = await prisma.user.create({
        data: {
            email: 'user@example.com',
            username: 'user',
            password: userPasswordHash,
            name: 'John Doe',
            role: 'USER',
            phoneNumber: '0987654321'
        }
    })

    // Categories
    const music = await prisma.category.create({
        data: { name: 'Music' },
    })

    const sports = await prisma.category.create({
        data: { name: 'Sports' },
    })

    const theater = await prisma.category.create({
        data: { name: 'Theater' },
    })

    // Venues
    const arena = await prisma.venue.create({
        data: {
            name: 'Stark Arena',
            address: 'Bulevar Arsenija Čarnojevića 58',
            capacity: 20000,
        },
    })

    const domOmladine = await prisma.venue.create({
        data: {
            name: 'Dom Omladine',
            address: 'Makedonska 22',
            capacity: 500,
        },
    })

    const jdp = await prisma.venue.create({
        data: {
            name: 'Jugoslovensko dramsko pozorište',
            address: 'Kralja Milana 50',
            capacity: 600,
        },
    })

    // Events
    const rockConcert = await prisma.event.create({
        data: {
            title: 'Rock Concert 2026',
            description: 'The biggest rock event of the year featuring top local bands.',
            date: new Date('2026-06-15T20:00:00Z'),
            price: 2500,
            venueId: arena.id,
            categoryId: music.id,
        },
    })

    await prisma.event.create({
        data: {
            title: 'Jazz Night',
            description: 'Smooth jazz evening with international guests.',
            date: new Date('2026-05-20T21:00:00Z'),
            price: 1200,
            venueId: domOmladine.id,
            categoryId: music.id,
        },
    })

    await prisma.event.create({
        data: {
            title: 'Basketball Derby',
            description: 'City derby match determine the champion.',
            date: new Date('2026-04-10T19:00:00Z'),
            price: 1500,
            venueId: arena.id,
            categoryId: sports.id,
        },
    })

    await prisma.event.create({
        data: {
            title: 'Hamlet',
            description: 'A modern adaptation of Shakespeare\'s classic.',
            date: new Date('2026-05-05T19:30:00Z'),
            price: 1800,
            venueId: jdp.id,
            categoryId: theater.id,
        },
    })

    // Seed Tickets
    const events = await prisma.event.findMany();
    for (const event of events) {
        for (let i = 0; i < 5; i++) {
            await prisma.ticket.create({
                data: {
                    eventId: event.id,
                    status: 'VALID',
                }
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
