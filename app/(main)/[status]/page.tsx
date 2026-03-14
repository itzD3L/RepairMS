import { notFound } from "next/navigation";
import { TicketCard } from "@/app/components/ui/tickets/ticketCard";
import { TicketCardType } from "@/app/lib/definitions";
import { mockDataTicketCard } from "@/app/lib/mockdata";
import {
    getStatusFromSlug,
    statusToSlugMap,
    isValidStatusSlug,
    statusSlugMap,
} from "@/app/utils/statusUtils";
import { TicketStatus } from "@/app/lib/definitions";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";

interface StatusPageProps {
    params: Promise<{ status: string }>;
}

export default async function StatusPage({ params }: StatusPageProps) {
    const { status: slug } = await params;

    if (!isValidStatusSlug(slug)) {
        notFound();
    }

    const status = getStatusFromSlug(slug as TicketStatus);
    const tickets = mockDataTicketCard.filter(
        (ticket) => ticket.status === status,
    );

    const statusConfig: Record<
        TicketStatus,
        { bg: string; accent: string; icon: string }
    > = {
        queued: {
            bg: "from-slate-100 to-slate-50",
            accent: "bg-slate-500",
            icon: "⏱️",
        },
        diagnosing: {
            bg: "from-blue-100 to-blue-50",
            accent: "bg-blue-500",
            icon: "🔍",
        },
        "waiting-for-parts": {
            // this is a string, not a TicketStatus
            bg: "from-orange-100 to-orange-50",
            accent: "bg-orange-500",
            icon: "📦",
        },
        repairing: {
            bg: "from-purple-100 to-purple-50",
            accent: "bg-purple-500",
            icon: "🔧",
        },
        pickup: {
            bg: "from-emerald-100 to-emerald-50",
            accent: "bg-emerald-500",
            icon: "✓",
        },
        completed: {
            bg: "from-slate-200 to-slate-100",
            accent: "bg-slate-600",
            icon: "✓✓",
        },
    };

    const config = statusConfig[statusToSlugMap[status as TicketStatus]];

    return (
        <div className="max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-1 min-w-[300px]">
                <div
                    className={`bg-gradient-to-br ${config.bg} rounded-t-xl p-4 border-b-2 ${config.accent.replace("bg-", "border-")}`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{config.icon}</span>
                            <h3 className="font-bold text-slate-800">
                                {status}
                            </h3>
                        </div>
                        <Badge
                            variant="secondary"
                            className="font-bold shadow-sm"
                        >
                            {tickets.length}
                        </Badge>
                    </div>
                    <div
                        className={`h-1 ${config.accent} rounded-full mt-2 opacity-60`}
                    />
                </div>
                <Card className="min-h-[500px] rounded-t-none border-t-0 p-3 space-y-3 bg-white/60 backdrop-blur-sm shadow-lg">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="transition-transform hover:scale-[1.02] active:scale-95"
                        >
                            <TicketCard ticket={ticket} />
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <div className="text-center text-slate-400 py-12">
                            <div className="text-4xl mb-2 opacity-30">
                                {config.icon}
                            </div>
                            <div className="text-sm font-medium">
                                No tickets
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
