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
export async function sendSystemMessage(chatId: string, eventName: string, context: SystemMessageContext) {
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

        // 2. Render template
        // We force recipient_role to 'owner' because the single message is visible to both,
        // but traditionally the "system" speaks to the owner about the new request.
        // Alternatively, we could render a neutral message, but current templates adhere to role logic.
        const renderContext = {
            ...context,
            recipient_role: 'owner'
        };

        // Fix: LiquidJS uses 'elsif' not 'elif'. The template in DB might have incorrect syntax.
        // We can hot-fix string before parsing, or better, update DB.
        // Let's hot-fix here to ensure it works immediately even if DB update lags.
        const safeTemplate = templateData.template_body.replace(/{% elif /g, '{% elsif ');

        const messageContent = await engine.parseAndRender(safeTemplate, renderContext);

        // 3. Get User ID (Sender = System? Or Current User? )
        // Traditionally system messages might come from the 'current user' or a special system ID.
        // In this app's logic (previous SQL), sender_id was the OWNER.
        // But if RENTER triggers it, we might want sender to be RENTER (so it appears on right?) 
        // OR sender=Owner (so it appears on left for renter?).
        // PREVIOUS SQL: sender_id = v_owner_id (The Owner sent it -> Appears on Right for Owner, Left for Renter).
        // WAIT. If Owner sent it, it appears as "Me" for Owner. 
        // Let's check previous SQL: 
        // sender_id = v_owner_id. 
        // So the message is "From Owner".
        // content: "Inquiry for..."

        // We will stick to sender_id = Owner so it looks official/system-like coming from the listing owner.
        // But we need the owner_id. We can get it from the chat or pass it in.
        // Let's fetch the chat to get owner_id if not passed?
        // Better: upsertConversation returns chatId? No, we need owner_id.
        // Let's look up the chat to get the owner_id.

        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .select('owner_id')
            .eq('id', chatId)
            .single();

        if (chatError || !chatData) {
            console.error('Error fetching chat owner:', chatError);
            return;
        }

        // 4. Insert Message via RPC to bypass RLS (since we are inserting as Owner)
        const { error: insertError } = await supabase.rpc('send_system_message', {
            p_chat_id: chatId,
            p_content: messageContent,
            p_sender_id: chatData.owner_id
        });

        if (insertError) {
            console.error('Error inserting system message:', insertError);
        }

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

        // If we have a chat ID and context (meaning it's a new inquiry or we want to send one),
        // we should check if we NEED to send a message.
        // The previous SQL logic ALWAYS sent a message if it created a NEW chat.
        // But it returned existing chat if found.
        // So we only want to send the message if it's a NEW conversation?
        // The RPC doesn't tell us if it was 'created' or 'found'.
        // PROBLEM: We don't want to spam "Inquiry" messages every time they click "Contact Owner" on an existing chat.
        //
        // Workaround: Check if there are ANY messages in this chat?
        // Or specific 'system' messages?
        //
        // Let's check if the chat has messages.
        if (context && chatId) {
            const { count, error: countError } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chatId);

            // If count is 0, it's a new chat (since RPC just created it and didn't insert anything).
            // Verify this logic holds. Yes, migration removed the insert.
            if (count === 0) {
                console.log('New chat detected, sending system message...');
                await sendSystemMessage(chatId, 'LISTING_INQUIRY', context);
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


