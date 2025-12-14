import { supabase } from "@/lib/supabase";
import { Liquid } from 'liquidjs';

const engine = new Liquid();

interface SystemMessageContext {
    tool_name: string;
    renter_name: string;
    start_date: string;
    end_date: string;
    total_cost: string;
    owner_notes_link: string;
    [key: string]: any;
}

/**
 * Send a system message using a template from the database
 */
export async function sendSystemMessage(
    chatId: string,
    eventName: string,
    context: SystemMessageContext,
    ownerId: string,
    renterId: string
) {
    try {
        // 1. Fetch template
        const { data: templateData, error: templateError } = await supabase
            .from('system_message_templates')
            .select('template_body')
            .eq('event_name', eventName)
            .single();

        if (templateError || !templateData) {
            console.error('Error fetching template:', templateError);
            return;
        }

        // Fix liquid syntax
        const safeTemplate = templateData.template_body.replace(/{% elif /g, '{% elsif ');

        // 2. Render Owner's Version
        const ownerContext = { ...context, recipient_role: 'owner' };
        const ownerContent = await engine.parseAndRender(safeTemplate, ownerContext);

        // 3. Render Renter's Version
        const renterContext = { ...context, recipient_role: 'renter' };
        const renterContent = await engine.parseAndRender(safeTemplate, renterContext);

        // 4. Insert Owner's Message (Visible to Owner, Recipient = Owner)
        // Sender = Owner (Me)
        const { error: ownerErr } = await supabase.rpc('send_system_message', {
            p_chat_id: chatId,
            p_content: ownerContent,
            p_sender_id: ownerId,
            p_recipient_id: ownerId
        });

        if (ownerErr) console.error('Error inserting owner system message:', ownerErr);

        // 5. Insert Renter's Message (Visible to Renter, Recipient = Renter)
        // Sender = Owner (from Owner to Renter)
        const { error: renterErr } = await supabase.rpc('send_system_message', {
            p_chat_id: chatId,
            p_content: renterContent,
            p_sender_id: ownerId,
            p_recipient_id: renterId
        });

        if (renterErr) console.error('Error inserting renter system message:', renterErr);

    } catch (error) {
        console.error('System message generation failed:', error);
    }
}

/**
 * Find or create a conversation between a renter and tool owner
 * Uses the upsert_conversation RPC function to ensure proper linking
 * @param toolId - The listing/tool ID
 * @param ownerId - The owner's User ID
 * @param context - The context variables for the system message
 * @returns The chat ID or null if failed
 */
export async function upsertConversation(toolId: string, ownerId: string, context?: SystemMessageContext): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }

        console.log('Calling upsert_conversation with:', { toolId, ownerId, renterId: user.id });

        // Call the RPC function (It now only Creates/Gets chat, DOES NOT insert message)
        const { data: chatId, error } = await supabase.rpc('upsert_conversation', {
            owner_id_in: ownerId,
            renter_id_in: user.id,
            listing_id_in: toolId
        });

        console.log('RPC response:', { chatId, error });

        if (error) {
            console.log('Raw error object:', error);
            throw error;
        }

        // Check if new chat and send message
        if (context && chatId) {
            const { count, error: countError } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chatId);

            if (count === 0) {
                console.log('New chat detected, sending system messages...');
                // Pass IDs to helper
                await sendSystemMessage(chatId, 'LISTING_INQUIRY', context, ownerId, user.id);
            } else {
                console.log('Chat exists with history, skipping system message.');
            }
        }

        return chatId;
    } catch (error: any) {
        console.error('Error upserting conversation:', error);
        throw error;
    }
}
