"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Search, Plus, Star, Filter } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ListingActions } from "@/app/components/listings/listing-actions";

const SearchInput = (props: any) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
            {...props}
            className="h-10 w-full pl-10 pr-4 rounded-full border border-slate-200 bg-white text-sm font-mono placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-safety-orange/50"
        />
    </div>
);

const ListingThumbnail = ({ title, src }: { title: string; src?: string }) => {
    const [error, setError] = useState(false);
    if (src && !error) {
        return <img src={src} alt={title} className="w-full h-full object-cover" onError={() => setError(true)} />;
    }
    return <span className="text-lg font-bold text-slate-400">{title.charAt(0)}</span>;
};

interface InventoryItem {
    listing_id: string;
    tool_title: string;
    daily_price: number;
    listing_status: string;
    avg_customer_rating: number;
    current_rental_end_date: string | null;
    current_renter_name: string | null;
    status: 'active' | 'draft' | 'archived';
    is_available: boolean;
    image_url?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const STATUS_TABS = ['all', 'active', 'draft', 'archived'] as const;

export default function InventoryPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => { document.title = 'My Fleet — BlockHyre'; }, []);

    useEffect(() => {
        const statusParam = searchParams.get('status');
        if (statusParam && STATUS_TABS.includes(statusParam.toLowerCase() as any)) {
            setStatusFilter(statusParam.toLowerCase());
        }
    }, [searchParams]);

    useEffect(() => {
        if (!user) return;
        const fetchInventory = async () => {
            try {
                const { data, error } = await supabase.rpc('get_owner_inventory_details', { p_owner_id: user.id });
                if (error) throw error;
                if (data) {
                    const listingIds = data.map((item: any) => item.listing_id);
                    const { data: imageData } = await supabase
                        .from('listings').select('id, images').in('id', listingIds);
                    const imageMap: Record<string, string> = {};
                    if (imageData) {
                        imageData.forEach((img: any) => {
                            if (img.images?.length > 0) imageMap[img.id] = img.images[0];
                        });
                    }
                    setInventory(data.map((item: any) => ({ ...item, image_url: imageMap[item.listing_id] })));
                }
            } catch (error) {
                console.error("Error fetching inventory:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, [user]);

    const filteredInventory = inventory.filter(item => {
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        const q = searchTerm.toLowerCase();
        return item.tool_title.toLowerCase().includes(q) ||
            (item.current_renter_name?.toLowerCase().includes(q) ?? false);
    });

    return (
        <div className="pt-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-8 bg-safety-orange" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-safety-orange">My Fleet</span>
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">Inventory</h1>
                    <p className="text-slate-500 mt-1 text-sm">Track your tools, pricing, and availability.</p>
                </div>
                <Link href="/add-tool">
                    <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-bold text-xs uppercase tracking-wider rounded-full px-6 h-10 shadow-lg shadow-safety-orange/20 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" />
                        List New Tool
                    </Button>
                </Link>
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-[2rem] border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {STATUS_TABS.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap ${statusFilter === status
                                    ? 'bg-charcoal text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-2 opacity-60">
                                {status === 'all' ? inventory.length : inventory.filter(i => i.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="w-full md:w-72">
                    <SearchInput
                        placeholder="Search fleet..."
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header: "Workshop Gray" borders, no bg colors — per Pillar 1 */}
                <div className="grid grid-cols-12 gap-4 border-b border-slate-100 p-4 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-12 md:col-span-5">Tool</div>
                    <div className="hidden md:block col-span-2">Status</div>
                    <div className="hidden md:block col-span-2">Rating</div>
                    <div className="hidden md:block col-span-2">Availability</div>
                    <div className="col-span-12 md:col-span-1 text-right">[ Act ]</div>
                </div>

                {/* Table Body */}
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                    </div>
                ) : filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                        <div
                            key={item.listing_id}
                            className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group"
                        >
                            {/* Tool Details */}
                            <div className="col-span-12 md:col-span-5">
                                <Link
                                    href={`/listings/${item.listing_id}/${item.tool_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    className="flex items-center gap-4 nav-bracket"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden border border-slate-100 group-hover:border-safety-orange/30 transition-colors">
                                        <ListingThumbnail title={item.tool_title} src={item.image_url} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-safety-orange transition-colors text-sm">
                                            <span className="nav-bracket-left">[</span>
                                            {item.tool_title}
                                            <span className="nav-bracket-right">]</span>
                                        </h3>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                                            {currencyFormatter.format(item.daily_price)} / day
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Status Telemetry */}
                            <div className="hidden md:flex col-span-2 items-center">
                                <div className={`flex items-center gap-2 text-xs font-mono font-bold ${item.status === 'active' ? 'text-emerald-600' :
                                        item.status === 'draft' ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                    <div className={`h-2 w-2 rounded-full ${item.status === 'active' ? 'bg-emerald-500 animate-pulse-operational' :
                                            item.status === 'draft' ? 'bg-slate-400' : 'bg-slate-300'
                                        }`} />
                                    {item.status.toUpperCase()}
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="hidden md:flex col-span-2 items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-slate-900 font-mono text-sm">
                                    {item.avg_customer_rating > 0 ? item.avg_customer_rating.toFixed(1) : '—'}
                                </span>
                            </div>

                            {/* Availability */}
                            <div className="hidden md:block col-span-2">
                                {item.current_renter_name ? (
                                    <div className="text-xs font-mono">
                                        <div className="text-safety-orange font-bold flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-safety-orange" />
                                            RENTED
                                        </div>
                                        <div className="text-slate-400 mt-0.5">
                                            until {dateFormatter.format(new Date(item.current_rental_end_date!))}
                                        </div>
                                    </div>
                                ) : (!item.is_available || item.status !== 'active') ? (
                                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                        {item.status === 'archived' ? 'ARCHIVED' : 'PAUSED'}
                                    </div>
                                ) : (
                                    <div className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-operational" />
                                        AVAILABLE
                                    </div>
                                )}
                            </div>

                            {/* Bracket Reveal Actions */}
                            <div className="col-span-12 md:col-span-1 flex justify-end">
                                <ListingActions
                                    listing={{
                                        id: item.listing_id,
                                        title: item.tool_title,
                                        status: item.status || 'active',
                                        is_available: (item.is_available && item.status === 'active' && !item.current_renter_name),
                                        isBooked: !!item.current_renter_name
                                    }}
                                    onUpdate={() => window.location.reload()}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center">
                        <Filter className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                        <p className="text-slate-400 text-sm font-mono">No tools match your filters.</p>
                        <Button
                            variant="link"
                            onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                            className="text-safety-orange text-xs font-mono mt-2"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
