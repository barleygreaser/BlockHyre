"use client";

import { useMessageNotifications } from "@/app/hooks/use-message-notifications";

export function MessageNotificationProvider() {
    useMessageNotifications();
    return null;
}
