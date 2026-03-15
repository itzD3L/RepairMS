import { notFound } from "next/navigation";
import { Suspense } from "react"; 

export default async function TicketDetailsPage({
    params,
}: {
    params: Promise<{ ticket_number: string }>;
}) {

    const { ticket_number } = await params;

    if (!ticket_number) {
        notFound();
    } // TODO: add not-found.tsx

    try {
        // const ticket = await fetchTicketDetailsByTicketNumber(ticket_number);
        // if (!ticket) {
        //     notFound();
        // }

        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* <Suspense> */}
                    {/* <TicketDetails ticket={ticket} /> */}
                {/* </Suspense> */}
            </main>
        )
    } catch (error) {
        console.error('Error fetching transaction:', error);
        notFound();
    }
}
