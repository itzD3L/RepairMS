"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLinkType, TicketStatus } from "@/app/lib/definitions";
import clsx from "clsx";
import { LayoutDashboard, Logs, SearchAlert, Toolbox, Cpu, Boxes, ListCheck, Menu, Settings, Search, Plus, CircleX } from "lucide-react";
// import { HiOutlineQueueList } from "react-icons/hi2";
// import { LuLayoutDashboard } from "react-icons/lu";
// import { LiaDiagnosesSolid, LiaToolsSolid } from "react-icons/lia";
// import { GoCpu } from "react-icons/go";
// import { CiBoxes } from "react-icons/ci";
// import { MdPlaylistAddCheck, MdMenu } from "react-icons/md";
// import { FaRegBell } from "react-icons/fa";
// import { IoMdClose } from "react-icons/io";
// import { IoSettingsOutline, IoSearch } from "react-icons/io5";
// import { GoPlus } from "react-icons/go";
import { useState, useEffect } from "react";
import { Button } from "../../reusable/button";
import { Input } from "../../reusable/input";

const navItems: NavLinkType[] = [
    {
        name: "Daily Digest",
        href: "/",
        icon: LayoutDashboard,
        count: 0,
    },
    {
        name: "Queued",
        href: "/queued",
        icon: Logs,
        count: 0,
    },
    {
        name: "Diagnosing",
        href: "/diagnosing",
        icon: SearchAlert,
        count: 0,
    },
    {
        name: "Waiting for Parts",
        href: "/waiting-for-parts",
        icon: Cpu,
        count: 0,
    },
    {
        name: "Repairing",
        href: "/repairing",
        icon: Toolbox,
        count: 0,
    },
    {
        name: "Ready for Pickup",
        href: "/pickup",
        icon: Boxes,
        count: 0,
    },
    {
        name: "Completed",
        href: "/completed",
        icon: ListCheck,
        count: 0,
    },
];

export default function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState("");
    // const urgentCount = tickets.filter(ticket => {
    //     const now = new Date();
    //     const deadline = new Date(ticket.estimatedCompletionDate);
    //     const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    //     return hoursUntilDeadline <= 5 && ticket.status !== 'completed' && ticket.status !== 'ready';
    //   }).length;

    return (
        <>
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden dark:text-slate-300"
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                            >
                                {isMobileMenuOpen ? (
                                    <CircleX className="size-5" />
                                ) : (
                                    <Menu className="size-5" />
                                )}
                            </Button>
                            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-blue-500/20 hidden sm:block">
                                <svg
                                    className="size-6 sm:size-7 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    ToyexFix
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                                    Repair Management System
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* {urgentCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="relative hover:bg-red-50 hover:border-red-200 transition-colors hidden sm:flex"
                                >
                                    <FaRegBell className="size-4 mr-2 text-red-600" />
                                    Alerts
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full size-5 flex items-center justify-center shadow-lg animate-pulse">
                                        {urgentCount}
                                    </span>
                                </Button>
                            )} */}

                            <Link key="settings" href="/settings">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="hover:bg-slate-50 transition-colors hidden sm:flex h-9 w-9"
                                >
                                    <Settings className="size-4 text-slate-600" />
                                </Button>
                            </Link>

                            <Link key="new-ticket" href="/new-ticket">
                                <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all text-xs sm:text-sm px-3 sm:px-4 h-9">
                                    <Plus className="size-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        New Ticket
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="Search tickets, customers, devices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                            />
                        </div>
                        {/* <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                            <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200 shadow-sm shrink-0">
                                <span className="text-[10px] sm:text-xs text-slate-600">
                                    Total
                                </span>
                                <div className="font-bold text-sm sm:text-lg text-slate-900 leading-tight">
                                    {tickets.length}
                                </div>
                            </div>
                            <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200 shadow-sm shrink-0">
                                <span className="text-[10px] sm:text-xs text-slate-600">
                                    Active
                                </span>
                                <div className="font-bold text-sm sm:text-lg text-blue-600 leading-tight">
                                    {
                                        tickets.filter(
                                            (t) => t.status !== "completed",
                                        ).length
                                    }
                                </div>
                            </div>
                            {urgentCount > 0 && (
                                <div className="bg-gradient-to-br from-red-50 to-rose-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-red-200 shadow-sm shrink-0 sm:hidden">
                                    <span className="text-[10px] sm:text-xs text-red-700">
                                        Urgent
                                    </span>
                                    <div className="font-bold text-sm sm:text-lg text-red-600 leading-tight">
                                        {urgentCount}
                                    </div>
                                </div>
                            )}
                        </div> */}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1 mt-6 border-b border-slate-200">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" &&
                                    pathname.startsWith(item.href));
                            // const isStatus = statuses.includes(
                            //     item.id as TicketStatus,
                            // );
                            // const statusCount = isStatus
                            //     ? tickets.filter((t) => t.status === item.id)
                            //           .length
                            //     : 0;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    // onDrop={(e) => {
                                    //     e.preventDefault();
                                    //     if (!isStatus) return;
                                    //     const ticketId =
                                    //         e.dataTransfer.getData("ticketId");
                                    //     if (ticketId)
                                    //         handleStatusChange(
                                    //             ticketId,
                                    //             item.id as TicketStatus,
                                    //         );
                                    // }}  change this to non clickable if already in
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                                        isActive
                                            ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                            : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                >
                                    {item.icon && (
                                        <item.icon className="size-4" />
                                    )}
                                    {item.name}
                                    {/* {isStatus && (
                                        <span
                                            className={`ml-1.5 text-xs py-0.5 px-2 rounded-full ${
                                                isActive
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {statusCount}
                                        </span>
                                    )} */}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* mobile navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative w-64 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-[slide-in-from-left_0.2s_ease-out]">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                                Menu
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <CircleX className="size-4" />
                            </Button>
                        </div>
                        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
                            <Link
                                key="settings"
                                href="/settings"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900 mb-2 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="size-4" />
                                        Settings
                                    </div>
                                </button>
                            </Link>
                            {navItems.map((item) => {
                                const isActive =
                                pathname === item.href ||
                                (item.href !== "/" &&
                                    pathname.startsWith(item.href));
                                // const isStatus = statuses.includes(
                                //     item.id as TicketStatus,
                                // );
                                // const statusCount = isStatus
                                //     ? tickets.filter(
                                //           (t) => t.status === item.id,
                                //       ).length
                                //     : 0;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.icon && (
                                                <item.icon className="size-4" />
                                            )}
                                            {item.name}
                                        </div>
                                        {/* {isStatus && (
                                            <span
                                                className={`text-xs py-0.5 px-2 rounded-full ${
                                                    isActive
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {statusCount}
                                            </span>
                                        )} */}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
