"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, Save } from "lucide-react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Button } from "@/app/components/reusable/button";
import { Input } from "@/app/components/reusable/input";
import { Textarea } from "@/app/components/reusable/textarea";
import { Label } from "@/app/components/reusable/label";
import { Card } from "@/app/components/reusable/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/components/reusable/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/reusable/select";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { createTicket, searchCustomersAutocomplete } from "@/app/utils/supabase/action";
import type { ticketState } from "@/app/utils/supabase/action";

const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
};

const fieldError = (errors: ticketState["errors"], key: keyof ticketState["errors"]) =>
    errors[key]?.[0] ?? null;

type CustomerSuggestion = {
    id: string;
    name: string;
    phone_number: string;
    email: string | null;
};

export default function TicketAdd() {
    const router = useRouter();
    const initialState: ticketState = {
        errors: {},
        success: false,
        message: null,
    };

    const [state, formAction, isPending] = useActionState(createTicket, initialState);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [deviceType, setDeviceType] = useState("");
    const [deviceBrand, setDeviceBrand] = useState("");
    const [deviceModel, setDeviceModel] = useState("");
    const [issueDescription, setIssueDescription] = useState("");
    const [estTimeRepair, setEstTimeRepair] = useState("");
    const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [customerLookupError, setCustomerLookupError] = useState<string | null>(null);
    const [hasSearchedCustomers, setHasSearchedCustomers] = useState(false);
    const [activeCustomerField, setActiveCustomerField] = useState<"name" | "phone" | null>(null);

    const photoInputRef = useRef<HTMLInputElement>(null);
    const customerLookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const customerLookupRequestIdRef = useRef(0);
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const pendingSubmissionDataRef = useRef<FormData | null>(null);

    useEffect(() => {
        if (!state.message) {
            return;
        }

        if (state.success) {
            toast.success(state.message);
            if (state.philSmsResponse?.status === "success") {
                toast.success(state.philSmsResponse.message);
            } else {
                toast.error(state.philSmsResponse?.message);
            }
            const timeout = setTimeout(() => {
                router.push("/queued");
                router.refresh();
            }, 700);

            return () => clearTimeout(timeout);
        }

        toast.error(state.message);
    }, [router, state.message, state.success]);

    useEffect(() => {
        if (!activeCustomerField || isPending) {
            return;
        }

        const query =
            activeCustomerField === "phone"
                ? customerPhone.trim()
                : customerName.trim();

        if (query.length < 3) {
            return;
        }

        const requestId = ++customerLookupRequestIdRef.current;

        if (customerLookupTimerRef.current) {
            clearTimeout(customerLookupTimerRef.current);
        }

        customerLookupTimerRef.current = setTimeout(async () => {
            setIsSearchingCustomers(true);
            setCustomerLookupError(null);
            const result = await searchCustomersAutocomplete(query);
            if (requestId !== customerLookupRequestIdRef.current) {
                return;
            }

            setIsSearchingCustomers(false);
            setHasSearchedCustomers(true);

            if (!result.success) {
                setCustomerSuggestions([]);
                setCustomerLookupError(
                    result.error ?? "Failed to lookup customers.",
                );
                return;
            }

            setCustomerSuggestions(result.data);
            setCustomerLookupError(null);
        }, 300);

        return () => {
            if (customerLookupTimerRef.current) {
                clearTimeout(customerLookupTimerRef.current);
                customerLookupTimerRef.current = null;
            }
        };
    }, [activeCustomerField, customerName, customerPhone, isPending]);

    const clearCustomerLookupState = () => {
        setCustomerSuggestions([]);
        setCustomerLookupError(null);
        setHasSearchedCustomers(false);
        setIsSearchingCustomers(false);
    };

    const handleCustomerFieldBlur = () => {
        setTimeout(() => {
            setActiveCustomerField(null);
            clearCustomerLookupState();
        }, 120);
    };

    const handleCustomerSuggestionSelect = (suggestion: CustomerSuggestion) => {
        setCustomerName(suggestion.name);
        setCustomerPhone(suggestion.phone_number);
        setCustomerEmail(suggestion.email ?? "");
        setActiveCustomerField(null);
        clearCustomerLookupState();
    };

    const renderCustomerSuggestions = (field: "name" | "phone") => {
        if (activeCustomerField !== field || isPending) {
            return null;
        }

        const query = field === "phone" ? customerPhone.trim() : customerName.trim();
        if (query.length < 3) {
            return null;
        }

        return (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                {isSearchingCustomers ? (
                    <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                        Searching customers...
                    </p>
                ) : customerLookupError ? (
                    <p className="px-3 py-2 text-sm text-red-600">
                        {customerLookupError}
                    </p>
                ) : customerSuggestions.length === 0 && hasSearchedCustomers ? (
                    <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                        No matching customer found.
                    </p>
                ) : (
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {customerSuggestions.map((suggestion) => (
                            <li key={suggestion.id}>
                                <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        handleCustomerSuggestionSelect(suggestion);
                                    }}
                                >
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                        {suggestion.name} • {suggestion.phone_number}
                                    </p>
                                    {suggestion.email ? (
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {suggestion.email}
                                        </p>
                                    ) : null}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError(null);

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setPhotoError("Please select an image file.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setPhotoError("Image size should be less than 10MB.");
            return;
        }

        if (selectedPhotoPreview) {
            URL.revokeObjectURL(selectedPhotoPreview);
        }

        const preview = URL.createObjectURL(file);
        setSelectedPhotoFile(file);
        setSelectedPhotoPreview(preview);
    };

    const removeImage = () => {
        if (selectedPhotoPreview) {
            URL.revokeObjectURL(selectedPhotoPreview);
        }
        setSelectedPhotoFile(null);
        setSelectedPhotoPreview(null);
        setPhotoError(null);
        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPhotoError(null);

        const formData = new FormData(event.currentTarget);

        if (selectedPhotoFile) {
            try {
                const compressedFile = await imageCompression(
                    selectedPhotoFile,
                    compressionOptions,
                );
                formData.set("photo", compressedFile, compressedFile.name);
            } catch {
                setPhotoError("Failed to compress photo. Please try another image.");
                return;
            }
        } else {
            formData.delete("photo");
        }

        pendingSubmissionDataRef.current = formData;
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmCreate = () => {
        const pendingFormData = pendingSubmissionDataRef.current;

        if (!pendingFormData) {
            setIsConfirmDialogOpen(false);
            return;
        }

        setIsConfirmDialogOpen(false);
        pendingSubmissionDataRef.current = null;

        startTransition(() => {
            formAction(pendingFormData);
        });
    };

    const handleCancelCreate = () => {
        pendingSubmissionDataRef.current = null;
        setIsConfirmDialogOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Dialog
                open={isConfirmDialogOpen}
                onOpenChange={(open) => {
                    setIsConfirmDialogOpen(open);
                    if (!open) {
                        pendingSubmissionDataRef.current = null;
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review details before creating ticket</DialogTitle>
                        <DialogDescription>
                            Please confirm the customer and device details are accurate. After creating
                            this ticket, the intake information cannot be edited from this page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={handleCancelCreate}>
                                Go Back
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={handleConfirmCreate}>
                            Yes, Create Ticket
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-5">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50"
                            >
                                <ArrowLeft className="size-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                New Repair Ticket
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Digital Device Intake
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6"> 
                    <div className="space-y-6">
                        {state.message ? (
                            <p
                                className={`rounded-lg border px-3 py-2 text-sm ${
                                    Object.keys(state.errors).length > 0
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                }`}
                            >
                                {state.message}
                            </p>
                        ) : null}

                        {/* Customer Information */}
                        <Card className="p-6 shadow-lg border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg
                                        className="size-5 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Customer Information
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Label htmlFor="customerName">
                                        Customer Name *
                                    </Label>
                                    <Input
                                        id="customerName"
                                        name="customer_name"
                                        value={customerName}
                                        onFocus={() => setActiveCustomerField("name")}
                                        onBlur={handleCustomerFieldBlur}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setCustomerName(value);
                                            setActiveCustomerField("name");
                                            if (value.trim().length < 3) {
                                                clearCustomerLookupState();
                                            } else {
                                                setHasSearchedCustomers(false);
                                                setCustomerLookupError(null);
                                            }
                                        }}
                                        placeholder="John Doe"
                                        required
                                    />
                                    {fieldError(state.errors, "customer_name") ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "customer_name",
                                            )}
                                        </p>
                                    ) : null}
                                    {renderCustomerSuggestions("name")}
                                </div>
                                <div className="relative">
                                    <Label htmlFor="customerPhone">
                                        Phone Number *
                                    </Label>
                                    <Input
                                        id="customerPhone"
                                        name="customer_phone"
                                        type="tel"
                                        value={customerPhone}
                                        onFocus={() => setActiveCustomerField("phone")}
                                        onBlur={handleCustomerFieldBlur}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            setCustomerPhone(
                                                value,
                                            );
                                            setActiveCustomerField("phone");
                                            if (value.trim().length < 3) {
                                                clearCustomerLookupState();
                                            } else {
                                                setHasSearchedCustomers(false);
                                                setCustomerLookupError(null);
                                            }
                                        }}
                                        maxLength={11}
                                        placeholder="09123456789"
                                        required
                                    />
                                    {fieldError(state.errors, "customer_phone") ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "customer_phone",
                                            )}
                                        </p>
                                    ) : null}
                                    {renderCustomerSuggestions("phone")}
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="customerEmail">
                                        Email (Optional)
                                    </Label>
                                    <Input
                                        id="customerEmail"
                                        name="customer_email"
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) =>
                                            setCustomerEmail(e.target.value)
                                        }
                                        placeholder="customer@email.com"
                                    />
                                    {fieldError(state.errors, "customer_email") ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "customer_email",
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </Card>

                        {/* Device Information */}
                        <Card className="p-6 shadow-lg border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg
                                        className="size-5 text-purple-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Device Information
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="deviceType">
                                        Device Type *
                                    </Label>
                                    <Select
                                        value={deviceType}
                                        onValueChange={setDeviceType}
                                    >
                                        <SelectTrigger id="deviceType">
                                            <SelectValue placeholder="Select device type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="phone">
                                                Phone
                                            </SelectItem>
                                            <SelectItem value="laptop">
                                                Laptop
                                            </SelectItem>
                                            <SelectItem value="tablet">
                                                Tablet
                                            </SelectItem>
                                            <SelectItem value="tv">
                                                TV
                                            </SelectItem>
                                            <SelectItem value="speaker">
                                                Speaker
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="hidden"
                                        name="device_type"
                                        value={deviceType}
                                        readOnly
                                    />
                                    {fieldError(state.errors, "device_type") ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "device_type",
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <Label htmlFor="brand">Brand *</Label>
                                    <Input
                                        id="brand"
                                        name="device_brand"
                                        value={deviceBrand}
                                        onChange={(e) =>
                                            setDeviceBrand(e.target.value)
                                        }
                                        placeholder="Apple, Samsung, Dell, etc."
                                        required
                                    />
                                    {fieldError(state.errors, "device_brand") ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "device_brand",
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Input
                                        id="model"
                                        name="device_model"
                                        value={deviceModel}
                                        onChange={(e) =>
                                            setDeviceModel(e.target.value)
                                        }
                                        placeholder="iPhone 14 Pro, Galaxy S23, XPS 15, etc."
                                    />
                                    {fieldError(state.errors, "device_model") ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "device_model",
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </Card>

                        {/* Issue Description */}
                        <Card className="p-6 shadow-lg border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <svg
                                        className="size-5 text-orange-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Issue Description
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="issueDescription">
                                        Describe the Issue *
                                    </Label>
                                    <Textarea
                                        id="issueDescription"
                                        name="issue_description"
                                        value={issueDescription}
                                        onChange={(e) =>
                                            setIssueDescription(e.target.value)
                                        }
                                        placeholder="Detailed description of the problem..."
                                        rows={4}
                                        required
                                    />
                                    {fieldError(
                                        state.errors,
                                        "issue_description",
                                    ) ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "issue_description",
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <Label htmlFor="estTimeRepair">
                                        Estimated Time to Repair
                                    </Label>
                                    <Input
                                        id="estTimeRepair"
                                        name="est_time_repair"
                                        type="datetime-local"
                                        value={estTimeRepair}
                                        onChange={(e) =>
                                            setEstTimeRepair(e.target.value)
                                        }
                                    />
                                    {fieldError(
                                        state.errors,
                                        "est_time_repair",
                                    ) ? (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldError(
                                                state.errors,
                                                "est_time_repair",
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </Card>

                        {/* Photos */}
                        <Card className="p-6 shadow-lg border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Camera className="size-5 text-green-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Photos
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="photoUpload"
                                        className="cursor-pointer"
                                    >
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 transition-all bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-900 dark:to-slate-800">
                                            <Camera className="size-12 mx-auto text-slate-400 mb-2" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Click to upload current device photo
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                One photo only. It will be compressed before upload.
                                            </p>
                                        </div>
                                    </Label>
                                    <Input
                                        id="photoUpload"
                                        name="photo"
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>

                                {selectedPhotoPreview ? (
                                    <div className="space-y-2">
                                        <Image
                                            src={selectedPhotoPreview}
                                            alt="Selected device"
                                            width={1200}
                                            height={720}
                                            className="h-52 w-full rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={removeImage}
                                        >
                                            Remove photo
                                        </Button>
                                    </div>
                                ) : null}
                                {photoError ? (
                                    <p className="text-sm text-red-600">{photoError}</p>
                                ) : null}
                                {fieldError(state.errors, "photo") ? (
                                    <p className="text-sm text-red-600">
                                        {fieldError(state.errors, "photo")}
                                    </p>
                                ) : null}
                            </div>
                        </Card>

                        {/* Submit */}
                        <div className="flex gap-3 justify-end">
                            <Link href="/">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 px-8"
                            >
                                <Save className="size-4 mr-2" />
                                {isPending ? "Creating..." : "Create Ticket"}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
