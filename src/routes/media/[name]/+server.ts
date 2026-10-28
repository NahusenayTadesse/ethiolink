import { servePublicFile } from '@nahu/admin-kit/server/servePublicFile';
import { isPublicImage } from '$lib/server/content';

/**
 * Public images — team photos, partner logos, service photos, news covers — for visitors who are
 * not signed in. `publicFileUrl(name)` from @nahu/admin-kit/files points here. Anything else in
 * the file store (CVs, shipping documents) is a 404 here, as if it did not exist.
 */
export const GET = servePublicFile({ isPublic: isPublicImage });
