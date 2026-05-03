import { convertToLocalTimeReadable } from "../timezone";

interface TicketSMSData {
    device_type: string;
    device_brand: string;
    ticket_number: string;
    customer_phone: string;
    created_at: Date;
}

export const formatPHNumber = (customer_phone: string) => {
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
    const { device_type, device_brand, ticket_number, customer_phone, created_at } = data;

    const formattedTime = await convertToLocalTimeReadable(created_at as Date);
    
    const deviceTypeLabel = device_type === "other" ? "" : device_type;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    return {
        customer_phone: formatPHNumber(customer_phone),
        message: `Hi! Thank you for choosing ToyexFix. A repair ticket for your ${device_brand} ${deviceTypeLabel} (Ticket #: ${ticket_number}) was successfully created on ${formattedTime}. \n\nTrack your live status here: ${appUrl}/portal/${ticket_number}`,
    }
}