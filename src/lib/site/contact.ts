/**
 * Map links for the office. The details themselves — address, phone, email, hours — are edited
 * in /dashboard/settings and reach the pages as `ContactDetails` (`$lib/server/content`).
 */
export const mapEmbedUrl = (query: string) =>
	`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;

export const directionsUrl = (query: string) =>
	`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
