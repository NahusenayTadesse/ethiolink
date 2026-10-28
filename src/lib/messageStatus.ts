/** Where a contact message stands. Kept outside the server folder so table cells can label it. */
export const MESSAGE_STATUSES = ['new', 'read', 'replied'] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const MESSAGE_LABELS: Record<MessageStatus, string> = {
	new: 'New',
	read: 'Read',
	replied: 'Replied'
};
