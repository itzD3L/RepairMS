export type TicketStatus = 'Daily Digest' | 'Queued' | 'Diagnosing' | 'Waiting for Parts' | 'Repairing' | 'Ready for Pickup' | 'Completed';

export interface NavLinkType {
    name: TicketStatus;
    href: string;
    icon: React.ElementType;
    count: number;
}