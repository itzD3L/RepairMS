import { TicketCard } from "@/app/components/ui/tickets/ticketCard";
import { TicketCardType } from "@/app/lib/definitions";
import { mockDataTicketCard } from "@/app/lib/mockdata";

export default function Queued() {
    return (
        <div>
            <h1>Queued</h1>
            {mockDataTicketCard.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket as TicketCardType} />
            ))}
        </div>
    )
}