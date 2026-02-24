'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    price: number;
    venue: { name: string; address: string };
    category: { name: string };
}

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [tickets, setTickets] = useState<{ id: number, status: string }[]>([]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Fetch event details
                const res = await fetch(`/api/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                    // Assuming the event endpoint returns tickets or we fetch them separately.
                    // The current event endpoint returns all tickets. Let's filter available ones.
                    if (data.tickets) {
                        setTickets(data.tickets.filter((t: any) => !t.userId && t.status === 'VALID'));
                    }
                } else {
                    router.push('/404');
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEvent();
    }, [id, router]);

    const handleBuyTicket = async (ticketId: number) => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            // Actually we set HttpOnly cookie, so JS can't read it.
            // But fetch api sends cookies automatically to same origin.
            // We need to handle 401 response.

            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // If using bearer, but we use cookie in simple setup
                },
                body: JSON.stringify({ ticketId }), // Sending ticketId
            });

            if (res.ok) {
                setPurchaseStatus('success');
                setIsModalOpen(true);
            } else {
                if (res.status === 401) {
                    router.push('/login');
                } else {
                    setPurchaseStatus('error');
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            setPurchaseStatus('error');
            setIsModalOpen(true);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!event) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-8 text-white">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                        {event.category?.name}
                    </span>
                    <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                    <div className="flex items-center text-blue-100 mt-2">
                        <span className="mr-6">📅 {new Date(event.date).toLocaleString()}</span>
                        <span>📍 {event.venue?.name}, {event.venue?.address}</span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">About this Event</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>

                        <div className="w-full md:w-80 flex-shrink-0">
                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-gray-500 mb-1">Ticket Price</p>
                                    <p className="text-3xl font-bold text-green-600 mb-6">${event.price}</p>

                                    <h3 className="font-bold mb-2">Available Tickets:</h3>
                                    {tickets.length > 0 ? (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {tickets.map(t => (
                                                <div key={t.id} className="flex justify-between items-center border p-2 rounded hover:bg-gray-50">
                                                    <span className="text-sm">Ticket #{t.id}</span>
                                                    <Button size="sm" onClick={() => handleBuyTicket(t.id)}>
                                                        Buy
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-red-500 font-medium">Sold Out</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ticket Purchase">
                {purchaseStatus === 'success' ? (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">Success!</h3>
                        <p className="text-gray-600">You have successfully purchased a ticket for {event.title}.</p>
                        <div className="mt-6">
                            <Button onClick={() => router.push('/profile')}>View My Tickets</Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-4">❌</div>
                        <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
                        <p className="text-gray-600">Something went wrong. Please try again later.</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
