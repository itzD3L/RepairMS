import { TicketCardType } from "@/app/lib/definitions";
import Link from "next/link";
import { CiLaptop, CiDesktop, CiSpeaker, CiCircleAlert, CiUser, CiClock2 } from "react-icons/ci";
import { IoIosPhonePortrait, IoIosTabletPortrait } from "react-icons/io";
import { MdDevicesOther } from "react-icons/md";
import { IoTvOutline } from "react-icons/io5";
import { Card } from "@/app/components/ui/card";
import { getTimeUntilDeadline, getTicketAlertLevelCard } from "@/app/utils/ticketUtils";

export function TicketCard({ ticket }: { ticket: TicketCardType }) {
    const {
        id,
        ticket_number,
        customer_name,
        device_type,
        device_brand,
        device_model,
        description,
        etr,
        status,
        total_cost,
    } = ticket;

    const alertLevel = getTicketAlertLevelCard(ticket);

    const getDeviceIcon = (size: string) => {
        switch (device_type) {
            case "phone":
                return <IoIosPhonePortrait className={size} />;
            case "laptop":
                return <CiLaptop className={size} />;
            case "tablet":
                return <IoIosTabletPortrait className={size} />;
            case "desktop":
                return <CiDesktop className={size} />;
            case "other":
                return <MdDevicesOther className={size} />;
            case "tv":
                return <IoTvOutline className={size} />;
            case "speaker":
                return <CiSpeaker className={size} />;
            default:
                return <MdDevicesOther className={size} />;
        }
    };

    const alertColors = {
        normal: "bg-white border-slate-200 hover:border-sky-300",
        warning:
            "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 hover:border-amber-400 shadow-amber-100",
        danger: "bg-gradient-to-br from-red-50 to-rose-50 border-red-300 hover:border-red-400 shadow-red-100",
    };

    const alertGlow = {
        normal: "",
        warning: "shadow-lg shadow-amber-200/50",
        danger: "shadow-lg shadow-red-200/50",
    };

    return (
        <Link href={`/ticket/${id}`}>
            <Card
                className={`p-4 cursor-pointer hover:shadow-xl transition-all duration-200 ${alertColors[alertLevel]} ${alertGlow[alertLevel]} ${isDragging ? "opacity-50" : ""} group`}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-sky-100 transition-colors">
                            {getDeviceIcon('size-4')}
                        </div>
                        <span className="font-bold text-slate-900">
                            {ticket_number}
                        </span>
                    </div>
                    {alertLevel !== "normal" && (
                        <div
                            className={`p-1 rounded-full ${alertLevel === "warning" ? "bg-amber-100" : "bg-red-100"}`}
                        >
                            <CiCircleAlert
                                className={`size-4 ${alertLevel === "warning" ? "text-amber-600" : "text-red-600"}`}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <CiUser className="size-3.5 text-slate-500" />
                        <span>{customer_name}</span>
                    </div>

                    <div className="text-sm">
                        <div className="font-semibold text-slate-800">
                            {device_brand} {device_model}
                        </div>
                        <div className="line-clamp-2 mt-1 text-slate-600 leading-relaxed">
                            {description}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs mt-3 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <CiClock2 className="size-3.5 text-slate-600" />
                        <span className="font-medium text-slate-700">
                            {getTimeUntilDeadline(
                                ticket.estimatedCompletionDate,
                            )}
                        </span>
                    </div>

                    {total_cost > 0 && (
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                            <Badge
                                variant={ticket.paid ? "default" : "secondary"}
                                className="font-bold shadow-sm"
                            >
                                ${ticket.cost}
                            </Badge>
                            {!ticket.paid && ticket.status === "ready" && (
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                                    Payment pending
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    );
}
