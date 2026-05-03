"use server"

import { z } from "zod";
import { cleanFileName } from "@/app/utils/utils";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { validStatusSlugs } from "../statusUtils";
import { redirect } from "next/navigation";
import { philSms } from "../sms/philsms";

const ticketSchema = z.object({
    id: z.string(),
    customer_name: z.string().trim().min(1, { message: "Name is required" }),
    customer_phone: z
        .string()
        .trim()
        .regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
    customer_email: z.preprocess(
        (val) => val === "" || val === null ? undefined : val,
        z.string().email("Please enter a valid email").optional(),
    ),
    device_type: z.string().trim().min(1, { message: "Device type is required" }),
    device_brand: z.string().trim().min(1, { message: "Brand is required" }),
    device_model: z.preprocess(
        (val) => val === "" || val === null ? undefined : val,
        z.string().trim().min(1, { message: "Model cannot be empty" }).optional(),
    ),
    issue_description: z
        .string()
        .trim()
        .min(1, { message: "Issue description is required" }),
    est_time_repair: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) {
                return undefined;
            }
            return new Date(String(val)); // Converts datetime-local string to Date.
        },
        z.date().optional(),
    ),
    photo: z.preprocess(
        (val) => {
            if (!(val instanceof File) || val.size === 0) {
                return undefined;
            }
            return val;
        },
        z.instanceof(File).optional(),
    ),
    status: z.enum(validStatusSlugs),
    technician_notes: z.string().optional(),
    repair_cost: z.number().optional(),
    parts_cost: z.number().optional()
})

const createTicketSchema = ticketSchema.omit({ id: true, status: true, technician_notes: true, repair_cost: true, parts_cost: true});
const updateTicketSchema = ticketSchema
    .omit({ id: true, customer_name: true, customer_phone: true, customer_email: true, device_type: true, device_brand: true, device_model: true, issue_description: true, photo: true })
    .extend({
        repair_cost: z.preprocess(
            (val) => {
                if (val === "" || val === null || val === undefined) {
                    return undefined;
                }
                return Number(val);
            },
            z.number().min(0, { message: "Repair cost must be 0 or higher." }).optional(),
        ),
        parts_cost: z.preprocess(
            (val) => {
                if (val === "" || val === null || val === undefined) {
                    return undefined;
                }
                return Number(val);
            },
            z.number().min(0, { message: "Parts cost must be 0 or higher." }).optional(),
        )
    });

export type CreateTicketPayload = z.infer<typeof createTicketSchema>;
type UpdateTicketPayload = z.infer<typeof updateTicketSchema>;
type TicketFieldKey = keyof CreateTicketPayload | keyof UpdateTicketPayload;

export type ticketState = {
    errors: Partial<Record<TicketFieldKey, string[]>>;
    success: boolean;
    message: string | null;
};

export async function createTicket(_prevState: ticketState, formData: FormData): Promise<ticketState> {
    const validatedFields = createTicketSchema.safeParse({
        customer_name: formData.get("customer_name"),
        customer_phone: formData.get("customer_phone"),
        customer_email: formData.get("customer_email"),
        device_type: formData.get("device_type"),
        device_brand: formData.get("device_brand"),
        device_model: formData.get("device_model"),
        issue_description: formData.get("issue_description"),
        est_time_repair: formData.get("est_time_repair"),
        photo: formData.get("photo"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
            message: "Please fix the highlighted fields.",
        };
    }

    const { customer_name, customer_phone, customer_email, device_type, device_brand, device_model, issue_description, est_time_repair, photo } = validatedFields.data;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let photoUrl = null;

    if (photo && photo instanceof File && photo.size > 0) {
        try {
            const fileName = cleanFileName(device_type, device_brand, photo.name);

            const { data, error } = await supabase.storage.from('device-photos').upload(fileName, photo, {
                cacheControl: '3600',
                upsert: false,
            });

            if (error) {
                console.error('Upload failed:', error.message)
                return {
                    errors: { photo: [error.message] },
                    success: false,
                    message: "Failed to upload photo. Please try again.",
                };
            }

            photoUrl = data.path;
        } catch (error) {
            console.error('Error uploading photo:', error)
            return {
                errors: { photo: ["Failed to upload photo. Please try again."] },
                success: false,
                message: "Failed to upload photo. Please try again.",
            };
        }
    }
    
    const { data, error } = await supabase.rpc('create_ticket', {
        p_customer_name: customer_name,
        p_customer_phone: customer_phone,
        p_customer_email: customer_email,
        p_device_type: device_type,
        p_device_brand: device_brand,
        p_device_model: device_model,
        p_issue_description: issue_description,
        p_est_time_repair: est_time_repair,
        p_photo: photoUrl,
    })
    // console.log(data);
    // {
    //     device_type: 'laptop',
    //     device_brand: 'Acer',
    //     ticket_number: 'rybjkf4b',
    //     status: 'queued',
    //     customer_phone: '09606084615',
    //     created_at: '2026-05-03T02:38:47.376546+00:00'
    // }
    if (error) {
        console.error('Error creating ticket:', error.message)
        return {
            errors: {},
            success: false,
            message: "Failed to create ticket. Please try again.",
        };
    } else {
        // const smsResponse = await philSms()
        return {
            errors: {},
            success: true,
            message: "Ticket created successfully.",
        }
        
    }
    
}

export async function updateTicket(id: string, _prevState: ticketState, formData: FormData): Promise<ticketState> {
    const validatedFields = updateTicketSchema.safeParse({
        status: formData.get("status"),
        est_time_repair: formData.get("est_time_repair"),
        technician_notes: formData.get("technician_notes"),
        repair_cost: formData.get("repair_cost"),
        parts_cost: formData.get("parts_cost")
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
            message: "Please fix the highlighted fields.",
        };
    }

    const { status, est_time_repair, technician_notes, repair_cost, parts_cost } = validatedFields.data;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
console.log(est_time_repair);
    const { error } = await supabase.rpc('update_ticket', {
        p_id: id,
        p_status: status,
        p_est_time_repair: est_time_repair ?? null, 
        p_technician_notes: technician_notes ?? null,
        p_repair_cost: repair_cost ?? null,
        p_parts_cost: parts_cost ?? null
    })


    if (error) {
        console.error('Error updating ticket:', error.message)
        return {
            errors: {},
            success: false,
            message: "Failed to update ticket. Please try again.",
        };
    } else {
        return {
            errors: {},
            success: true,
            message: "Ticket updated successfully.",
        }
        
    }
}    

export async function deleteTicket(id: string): Promise<ticketState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.rpc('delete_ticket', {
        p_id: id
    })

    if (error) {
        console.error('Error deleting ticket:', error.message)
        return {
            errors: {},
            success: false,
            message: "Failed to delete ticket. Please try again.",
        };
    } else {
        return {
            errors: {},
            success: true,
            message: "Ticket deleted successfully.",
        };
    }
}

export async function checkoutTicket(id: string, paid: boolean): Promise<ticketState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.rpc('checkout_ticket', {
        p_id: id,
        p_paid: paid
    })

    if (error) {
        console.error('Error checking out ticket:', error.message)
        return {
            errors: {},
            success: false,
            message: "Failed to check out ticket. Please try again.",
        };
    } else {
        return {
            errors: {},
            success: true,
            message: "Ticket checked out successfully.",
        };
    }
}

///////////////////////////////////////////////////////////////////////
// Login Actions
const LOGIN_ROUTE = "/login";
const DEFAULT_REDIRECT = "/";

const encodeMessage = (message: string) => encodeURIComponent(message);
const safeRedirectPath = (input: string) =>
    input.startsWith("/") ? input : DEFAULT_REDIRECT;

export async function loginWithPassword(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const next = safeRedirectPath(String(formData.get("next") ?? DEFAULT_REDIRECT));

    if (!email || !password) {
        redirect(`${LOGIN_ROUTE}?error=${encodeMessage("Email and password are required.")}`);
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        redirect(`${LOGIN_ROUTE}?error=${encodeMessage(error.message)}`);
    }

    redirect(next);
}

export async function searchTicket(ticketNumber: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
console.log(ticketNumber);
    const { data, error } = await supabase.rpc('search_ticket', {
        p_ticket_number: ticketNumber
    })

    if (error) {
        return {
            success: false,
            data: null,
            error: "We couldn't verify that ticket right now. Please try again.",
        };
    }

    if (!data || data.length === 0) {
        return {
            success: false,
            data: null,
            error: "Ticket not found. Please check your ticket number and try again.",
        };
    }

    return {
        success: true,
        data: data,
        error: null,
    };
}

type CustomerAutocompleteResult = {
    id: string;
    name: string;
    phone_number: string;
    email: string | null;
};

export async function searchCustomersAutocomplete(query: string) {
    const normalizedQuery = String(query ?? "").trim();
    if (normalizedQuery.length < 3) {
        return {
            success: true,
            data: [] as CustomerAutocompleteResult[],
            error: null as string | null,
        };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.rpc("search_customers_autocomplete", {
        p_query: normalizedQuery,
    });

    if (error) {
        console.error("Failed to search customers:", error.message);
        return {
            success: false,
            data: [] as CustomerAutocompleteResult[],
            error: "Failed to search customers. Please try again.",
        };
    }

    const normalizedData: CustomerAutocompleteResult[] = (data ?? []).map(
        (row: Partial<CustomerAutocompleteResult>) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? ""),
            phone_number: String(row.phone_number ?? ""),
            email: row.email ? String(row.email) : null,
        }),
    );

    return {
        success: true,
        data: normalizedData,
        error: null as string | null,
    };
}



///////////////////////////////////////////////////////////////////////
// Settings Actions
export async function signOut() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    redirect("/login");
}

export async function saveStoreDetails(
    _prevState: { success: boolean; message: string },
    formData: FormData,
) {
    const id = String(formData.get("id") ?? "").trim();
    const shopName = String(formData.get("shop_name") ?? "").trim();
    const physicalAddress = String(formData.get("physical_address") ?? "").trim();
    const contactNumber = String(formData.get("contact_number") ?? "").trim();

    if (!id) {
        return { success: false, message: "Store record id is missing." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.rpc("update_store_details", {
        p_id: id,
        p_shop_name: shopName || null,
        p_physical_address: physicalAddress || null,
        p_contact_number: contactNumber || null,
    });

    if (error) {
        return {
            success: false,
            message:
                "Failed to save store details right now. Please try again.",
        };
    }

    if (!data) {
        return {
            success: false,
            message: "Store details were not updated. Please try again.",
        };
    }

    return { success: true, message: "Store details updated successfully." };
}
