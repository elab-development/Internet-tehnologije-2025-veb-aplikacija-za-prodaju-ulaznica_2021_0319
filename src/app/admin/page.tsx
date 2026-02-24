'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    price: number;
    venueId: number;
    categoryId: number;
    venue?: { name: string };
    category?: { name: string };
}

interface Item {
    id: number;
    name: string;
}

export default function AdminPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Item[]>([]);
    const [venues, setVenues] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        price: '',
        venueId: '',
        categoryId: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        if (user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            const [eventsRes, catsRes, venuesRes] = await Promise.all([
                fetch('/api/events'),
                fetch('/api/categories'),
                fetch('/api/venues') // We might need to implement this or hardcode for now if API missing
            ]);

            if (eventsRes.ok) setEvents(await eventsRes.json());
            if (catsRes.ok) setCategories(await catsRes.json());

            // Temporary fix if venues api doesn't exist, we can fetch from events or just hardcode for MVP
            // Actually implementation plan implies we might not have GET /api/venues, let's check or handle gracefully
            // For now, let's assume we need to add it or it exists. 
            // Checking previous context, we only implemented events/auth/tickets.
            // I'll add a quick route for venues or just mock it if needed, but better to add the route.
            if (venuesRes.ok) {
                setVenues(await venuesRes.json());
            }

        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEvents(events.filter(e => e.id !== id));
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent)
            });

            if (res.ok) {
                alert('Event created successfully');
                setIsModalOpen(false);
                setNewEvent({ title: '', description: '', date: '', price: '', venueId: '', categoryId: '' });
                fetchData();
            } else {
                alert('Failed to create event');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add New Event</Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                            <div className="text-sm text-gray-500">{event.venue?.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">${event.price}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <Input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <Input value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <Input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <Input type="number" value={newEvent.price} onChange={e => setNewEvent({ ...newEvent, price: e.target.value })} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                value={newEvent.categoryId}
                                onChange={e => setNewEvent({ ...newEvent, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Venue</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                value={newEvent.venueId}
                                onChange={e => setNewEvent({ ...newEvent, venueId: e.target.value })}
                                required
                            >
                                <option value="">Select Venue</option>
                                {/* We need venues loaded here. If API missing, we might see empty list */}
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Create Event</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
