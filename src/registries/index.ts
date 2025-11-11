/**
 * Registry Exports
 * Centralized exports for all registries
 */

// Page Registry
export {
  PageRegistry,
  createPageRegistry,
} from './page.registry';

// Service Registry
export {
  ServiceRegistry,
  createServiceRegistry,
} from './service.registry';

// App Registry (combined)
export {
  AppRegistry,
  MultiUserRegistry,
  createAppRegistry,
  createMultiUserRegistry,
} from './app.registry';
