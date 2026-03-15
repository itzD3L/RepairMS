import { TicketDetailsType, TicketStatus, } from "@/app/lib/definitions";
import Link from "next/link";
import { Button } from "@/app/components/reusable/button";
import { Card } from "@/app/components/reusable/card";
import { Badge } from "@/app/components/reusable/badge";
import { Textarea } from "@/app/components/reusable/textarea";
import { Label } from "@/app/components/reusable/label";
import {
    ArrowLeft,
    Phone,
    Mail,
    Camera,
    QrCode,
    PhilippinePeso,
    Pencil
} from "lucide-react";
import {
    getTicketAlertLevel,
    getTimeUntilDeadline,
} from "@/app/utils/ticketUtils";
import { getStatusFromSlug } from "@/app/utils/statusUtils";
import ImageModal from "@/app/components/reusable/imageModal";


export default function TicketDetails({ ticket } : { ticket: TicketDetailsType }) {

    const {id, ticket_number, customer_id, customer_name, customer_phone, customer_email, device_type, device_brand, device_model, issue_description, technician_notes, etr, photo, timeline, payment, status} = ticket;
    const alertLevel = getTicketAlertLevel({ etr, status });

    const alertBorders = {
        normal: "border-gray-200",
        warning: "border-yellow-400 border-2",
        danger: "border-red-400 border-2",
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/${status}`}>
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
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    {ticket_number}
                                </h1>
                                <p className="text-sm text-slate-600">
                                    {customer_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/checkout/${id}`}>
                                <Button
                                    variant="outline"
                                    className="hover:bg-blue-50 hover:border-blue-200"
                                >
                                    <QrCode className="size-4 md:mr-2" />
                                    <span className="hidden md:block">Checkout</span>
                                </Button>
                            </Link>
                            <Link href={`/ticket/${id}/edit`}>
                                <Button
                                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
                                >
                                    <Pencil className="size-4 md:mr-2" />
                                    <span className="hidden md:block">Edit</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Status Card */}
                        <Card className={`p-6 ${alertBorders[alertLevel]}`}>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold">
                                    Status
                                </h2>
                                {alertLevel !== "normal" && (
                                    <Badge
                                        variant={
                                            alertLevel === "warning"
                                                ? "outline"
                                                : "destructive"
                                        }
                                    >
                                        {alertLevel === "warning"
                                            ? "Due Soon"
                                            : "Overdue"}
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Current Status</Label>
                                    <span className="text-sm text-slate-600 font-medium">
                                        {getStatusFromSlug(status as TicketStatus)}
                                    </span>
                                </div>

                                <div>
                                    <Label>Estimated Completion</Label>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-600">
                                            {etr ? new Date(
                                                etr
                                            ).toLocaleString() : "- -"}
                                        </span>
                                        <Badge
                                            variant={
                                                alertLevel === "danger"
                                                    ? "destructive"
                                                    : alertLevel === "warning"
                                                        ? "outline"
                                                        : "secondary"
                                            }
                                        >
                                            {getTimeUntilDeadline(
                                                etr
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Device Information */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Device Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">
                                        Device Type
                                    </Label>
                                    <p className="font-medium">
                                        {device_type}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">
                                        Brand
                                    </Label>
                                    <p className="font-medium">
                                        {device_brand}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-gray-600">
                                        Model
                                    </Label>
                                    <p className="font-medium">
                                        {device_model}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Issue Description */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Issue Description
                            </h2>
                            <p className="text-gray-700">
                                {issue_description}
                            </p>
                        </Card>

                        {/* Technician Notes */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Technician Notes
                            </h2>
                            <Textarea
                                value={technician_notes}
                                placeholder="Add notes about the repair process..."
                                rows={4}
                                disabled={true}
                            />
                        </Card>

                        {/* Photos */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Photos
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    {photo && photo.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            <ImageModal src={photo} alt="Device Photo" />
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                            <Camera className="size-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">
                                                No photos uploaded
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Customer
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-gray-600">
                                        Name
                                    </Label>
                                    <p className="font-medium">
                                        {customer_name}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">
                                        Phone
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="size-4 text-gray-400" />
                                        <p className="font-medium">
                                            {customer_phone}
                                        </p>
                                    </div>
                                </div>
                                {customer_email && (
                                    <div>
                                        <Label className="text-gray-600">
                                            Email
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="size-4 text-gray-400" />
                                            <p className="font-medium text-sm">
                                                {customer_email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={() => window.location.href = `tel:${customer_phone}`}
                                >
                                    <Phone className="size-4 mr-2" />
                                    Call Customer
                                </Button>
                            </div>
                        </Card>

                        {/* Tracking */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Tracking
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-gray-600">
                                        Tracking ID
                                    </Label>
                                    <p className="font-mono text-sm">
                                        {ticket_number}
                                    </p>
                                </div>
                                <Link
                                    href={`/customer/${ticket_number}`}
                                    target="_blank"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View Customer Portal
                                    </Button>
                                </Link>
                            </div>
                        </Card>

                        {/* Payment */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Payment
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <Label>Repair Cost</Label>
                                    <div className="flex items-center gap-2">
                                        <PhilippinePeso className="size-4 text-gray-400" />
                                        {/*  map through the payment object and display the repair cost, parts cost, tax, and total */}
                                        {Object.entries(payment).map(([key, value]) => (
                                            <div key={key}>
                                                <Label>{key}</Label>
                                                <p>{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        payment.paid ? "default" : "secondary"
                                    }
                                    className="w-full justify-center"
                                >
                                    {payment.paid ? "Paid" : "Unpaid"}
                                </Badge>
                            </div>
                        </Card>

                        {/* Timeline */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold pb-4 border-b border-slate-200">
                                Timeline
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <Label className="text-gray-600">
                                        Created
                                    </Label>
                                    <p>
                                        {new Date(
                                            timeline.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-600">
                                        Last Updated
                                    </Label>
                                    <p>
                                        {new Date(
                                            timeline.updated_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}