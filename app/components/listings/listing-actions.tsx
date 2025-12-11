"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Eye, Calendar, Pause, Play, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getDisplayStatus } from '@/lib/listing-status';
import { ContextualListing } from '@/app/types/listing-types';

interface ListingActionsProps {
    listing: ContextualListing;
    onUpdate: () => void;
}

export function ListingActions({ listing, onUpdate }: ListingActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const displayStatus = getDisplayStatus(listing);

    const handleAction = async (action: string) => {
        setLoading(true);
        try {
            switch (action) {
                case 'edit':
                    router.push(`/owner/listings/edit/${listing.id}`);
                    break;

                case 'preview':
                    router.push(`/listings/${listing.id}/preview`);
                    break;

                case 'availability':
                    // Navigate to calendar section of edit page
                    router.push(`/owner/listings/edit/${listing.id}#availability`);
                    break;

                case 'pause':
                    await supabase
                        .from('listings')
                        .update({ is_available: false })
                        .eq('id', listing.id);
                    toast.success('Listing paused');
                    onUpdate();
                    break;

                case 'activate':
                    await supabase
                        .from('listings')
                        .update({ is_available: true })
                        .eq('id', listing.id);
                    toast.success('Listing activated');
                    onUpdate();
                    break;

                case 'publish':
                    await supabase
                        .from('listings')
                        .update({ status: 'active', is_available: true })
                        .eq('id', listing.id);
                    toast.success('Listing published');
                    onUpdate();
                    break;

                case 'archive':
                    await supabase
                        .from('listings')
                        .update({ status: 'archived' })
                        .eq('id', listing.id);
                    toast.success('Listing archived');
                    onUpdate();
                    break;

                case 'unarchive':
                    await supabase
                        .from('listings')
                        .update({ status: 'draft' })
                        .eq('id', listing.id);
                    toast.success('Listing unarchived');
                    onUpdate();
                    break;

                case 'delete':
                    toast.custom(
                        (t) => (
                            <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                                <p className="font-medium">Delete this draft? This cannot be undone.</p>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toast.dismiss(t)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={async () => {
                                            toast.dismiss(t);
                                            try {
                                                await supabase
                                                    .from('listings')
                                                    .delete()
                                                    .eq('id', listing.id);
                                                toast.success('Draft deleted');
                                                onUpdate();
                                            } catch (error) {
                                                console.error('Delete error:', error);
                                                toast.error('Failed to delete draft');
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ),
                        {
                            duration: Infinity,
                        }
                    );
                    break;
            }
        } catch (error) {
            console.error('Action error:', error);
            toast.error('Failed to perform action');
        } finally {
            setLoading(false);
        }
    };

    // Build contextual menu items
    const menuItems = [];

    // Common actions
    menuItems.push(
        { label: 'Edit Listing', action: 'edit', icon: Edit },
        { label: 'Preview Listing', action: 'preview', icon: Eye }
    );

    // Status-specific actions
    if (displayStatus === 'Active') {
        menuItems.push(
            { label: 'Block Dates', action: 'availability', icon: Calendar },
            { label: 'Pause Listing', action: 'pause', icon: Pause }
        );
    } else if (displayStatus === 'Paused') {
        menuItems.push(
            { label: 'Block Dates', action: 'availability', icon: Calendar },
            { label: 'Re-activate Listing', action: 'activate', icon: Play }
        );
    } else if (displayStatus === 'Draft') {
        menuItems.push(
            { label: 'Publish Listing', action: 'publish', icon: Play },
            { label: 'Delete Draft', action: 'delete', icon: Trash2, destructive: true }
        );
    } else if (displayStatus === 'Archived') {
        menuItems.push(
            { label: 'Unarchive', action: 'unarchive', icon: Archive }
        );
    }

    // Archive action for non-archived listings
    if (displayStatus !== 'Archived' && displayStatus !== 'Draft') {
        menuItems.push(
            { label: 'Archive Listing', action: 'archive', icon: Archive, destructive: true }
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {menuItems.map((item, index) => {
                    const showSeparator = index > 0 && index === menuItems.length - 1 && item.destructive;
                    return (
                        <div key={item.action}>
                            {showSeparator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={() => handleAction(item.action)}
                                className={item.destructive ? 'text-red-600 focus:text-red-600' : ''}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </DropdownMenuItem>
                        </div>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
