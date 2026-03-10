import Header from "@/app/components/ui/header/header";

export default function Layout({ children } : { children: React.ReactNode}) {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Header />
            {children}
        </div>
    )
}