import React from 'react';
import { MessageSquare } from 'lucide-react';

export const InboxView = ({ t }: { t: any }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
        <p>{t.hostInbox}</p>
    </div>
);