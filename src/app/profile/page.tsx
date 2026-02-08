'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

interface Ticket {
    id: number;
    event: {
        title: string;
        date: string;
        venueId: number;
    };
    purchasedAt: string;
    status: string;
}

export default function ProfilePage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);
    const router = useRouter();

    const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [newTicketId, setNewTicketId] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
        fetchTickets();
    }, [router]);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/tickets');
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            } else {
                // If 401, redirect
                if (res.status === 401) router.push('/login');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelTicket = async (ticketId: number) => {
        if (!confirm('Are you sure you want to cancel this ticket?')) return;

        try {
            const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
            if (res.ok) {
                setTickets(tickets.filter(t => t.id !== ticketId));
            } else {
                alert('Failed to cancel ticket');
            }
        } catch (error) {
            console.error(error);
            alert('Error cancelling ticket');
        }
    };

    const openExchangeModal = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setNewTicketId('');
        setExchangeModalOpen(true);
    };

    const handleExchangeTicket = async () => {
        if (!selectedTicketId || !newTicketId) return;

        try {
            const res = await fetch(`/api/tickets/${selectedTicketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newTicketId: parseInt(newTicketId) })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Ticket exchanged successfully!');
                setExchangeModalOpen(false);
                fetchTickets(); // Refresh list to show new ticket
            } else {
                alert(data.message || 'Failed to exchange ticket');
            }
        } catch (error) {
            console.error(error);
            alert('Error exchanging ticket');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                {user && (
                    <div className="mt-4 bg-white p-6 rounded-lg shadow-sm border">
                        <p className="text-gray-600">Name: <span className="font-semibold text-gray-900">{user.name}</span></p>
                        <p className="text-gray-600">Email: <span className="font-semibold text-gray-900">{user.email}</span></p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Tickets</h2>
            {tickets.length === 0 ? (
                <p className="text-gray-500 bg-white p-8 rounded-lg border text-center">You haven&apos;t purchased any tickets yet.</p>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-white">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.event.title}</h3>
                                    <p className="text-gray-600">📅 {new Date(ticket.event.date).toLocaleString()}</p>
                                    <p className="text-sm text-gray-400 mt-2">Purchased on: {new Date(ticket.purchasedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.status === 'VALID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-xs text-gray-400">Ticket ID: #{ticket.id}</span>
                                    {ticket.status === 'VALID' && (
                                        <div className="flex gap-3 mt-2">
                                            <button
                                                onClick={() => openExchangeModal(ticket.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                            >
                                                Exchange
                                            </button>
                                            <button
                                                onClick={() => handleCancelTicket(ticket.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={exchangeModalOpen} onClose={() => setExchangeModalOpen(false)} title="Exchange Ticket">
                <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                        Enter the ID of the new ticket you want to switch to.
                        <br />
                        <span className="text-xs text-gray-400">Note: The new ticket must be available and unsold.</span>
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Ticket ID</label>
                        <input
                            type="number"
                            value={newTicketId}
                            onChange={(e) => setNewTicketId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. 123"
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleExchangeTicket}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={!newTicketId}
                        >
                            Confirm Exchange
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
