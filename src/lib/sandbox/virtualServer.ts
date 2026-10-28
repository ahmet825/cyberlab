import { VirtualRouter } from './router';
import type { VirtualHttpRequest, VirtualHttpResponse } from './types';
import {
  handleHome,
  handleAbout,
  handleStatus,
  handleLogin,
  handleRobotsTxt,
  handleAdminSecretPortal,
  handleDocuments
} from './handlers/portalHandler';
import { handleSearch } from './handlers/searchHandler';
import { handleInventory } from './handlers/inventoryHandler';
import { handleUsers } from './handlers/usersHandler';
import { handleProfile } from './handlers/profileHandler';
import { handleForgotPassword } from './handlers/authHandler';
import { handleAdmin } from './handlers/adminHandler';
import { handleVaultFlag, handleVaultLookup } from './handlers/vaultHandler';
import { handleBlogPost } from './handlers/blogHandler';
import { handleChat } from './handlers/chatHandler';

export type { VirtualHttpRequest, VirtualHttpResponse } from './types';

// Instantiate the modular sandbox router
const router = new VirtualRouter();

// 1. Portal & Basic Routes
router.all('/', handleHome);
router.all('/index.html', handleHome);
router.all('/about', handleAbout);
router.all('/status', handleStatus);
router.all('/login', handleLogin);
router.all('/robots.txt', handleRobotsTxt);
router.all('/admin_secret_portal', handleAdminSecretPortal);
router.all('/documents', handleDocuments);

// 2. Challenge-01: Reflected XSS
router.all('/search', handleSearch);

// 3. Challenge-02 & Challenge-07: SQLite WASM (UNION & Blind Boolean)
router.all('/inventory', handleInventory);

// 4. Challenge-03: HTTP Verb Tampering
router.all('/api/v1/users', handleUsers);
router.all('/users', handleUsers);

// 5. Challenge-04: DOM JSON XSS
router.all('/profile', handleProfile);

// 6. Challenge-05: Host Header Injection
router.all('/forgot-password', handleForgotPassword);
router.all('/reset-password', handleForgotPassword);

// 7. Challenge-06: Multi-Hop Header Spoofing
router.all('/admin', handleAdmin);
router.all('/admin/console', handleAdmin);

// 8. Challenge-08 & Challenge-09: BOLA & JWT None Algorithm
router.all('/api/v2/vault/flag', handleVaultFlag);

// 9. Challenge-10: Stored Markdown XSS
router.all('/post', handleBlogPost);

// 10. Challenge-11: Error-Based Cast SQLi
router.all('/api/vault/lookup', handleVaultLookup);

// 11. Challenge-12: LLM System Prompt Leak
router.all('/chat', handleChat);
router.all('/api/v1/support/chat', handleChat);

/**
 * Universal Virtual Server Dispatcher.
 * Dispatches simulated HTTP requests against the modular router and returns real HTML responses.
 */
export async function dispatchVirtualHttpRequest(
  incoming: VirtualHttpRequest
): Promise<VirtualHttpResponse> {
  return router.handle(incoming);
}
