import { TicketCardType, TicketType } from "../lib/definitions";

export const getTicketAlertLevel = (ticket: TicketCardType | TicketType): 'normal' | 'warning' | 'danger' => {
    const now = new Date();
    const deadline = ticket.etr ? new Date(ticket.etr) : null;
    const hoursUntilDeadline = deadline ? (deadline.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;
    
    if (ticket.status === 'completed' || ticket.status === 'pickup') {
        return 'normal';
    }
    
    if (hoursUntilDeadline < 0) {
      return 'danger'; // Overdue
    } else if (hoursUntilDeadline <= 5) {
      return 'warning'; // Within 5 hours of deadline
    }
    
    return 'normal';
};

export const getTimeUntilDeadline = (deadline: Date | undefined): string => {
    if (!deadline || deadline === undefined) {
        return 'No deadline';
    }

    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
        return `Overdue by ${Math.abs(hours)}h ${Math.abs(minutes)}m`;
    }

    if (hours === 0) {
        return `${minutes}m remaining`;
    }

    return `${hours}h ${minutes}m remaining`;
};