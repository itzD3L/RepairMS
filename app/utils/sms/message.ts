import { convertToLocalTimeReadable } from "../timezone";
import { getStatusFromSlug } from "../statusUtils";
import { TicketStatus } from "@/app/lib/definitions";

interface TicketSMSData {
    device_type: string;
    device_brand: string;
    ticket_number: string;
    status: TicketStatus;
    customer_phone: string;
    created_at: Date;
}

export const formatPHNumber = (customer_phone: string) => {
    if (!customer_phone) return null;

    // remove spaces, dashes, plus signs
    let cleaned = customer_phone.replace(/[\s-+]/g, "");

    // case 1: 09123456789 → 639123456789
    if (cleaned.startsWith("09")) {
        cleaned = "63" + cleaned.substring(1);
    }

    // case 2: +639123456789 → 639123456789 (already handled above)
    // case 3: 9123456789 (missing leading 0)
    else if (cleaned.startsWith("9") && cleaned.length === 10) {
        cleaned = "63" + cleaned;
    }

    return cleaned;
};

export const buildTicketCreatedSms = async (data: TicketSMSData) => {
    const { device_type, device_brand, ticket_number, status, customer_phone, created_at } = data;

    const statusLabel = getStatusFromSlug(status);
    const formattedTime = await convertToLocalTimeReadable(created_at);
    
    const deviceTypeLabel = device_type === "other" ? "" : device_type;

    return {
        customer_phone: formatPHNumber(customer_phone),
        message: `Hi! Thank you for choosing ToyexFix. Your ${device_brand} ${deviceTypeLabel} — ${statusLabel} (${formattedTime}). Ticket ${ticket_number}. Track: https://toyexfix.vercel.app/portal/${ticket_number}`,
    }
}