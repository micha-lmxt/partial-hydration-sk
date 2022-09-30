import type { SvelteComponentTyped } from 'svelte';


export {default as PartialApp} from './partialApp';

export {default as Hydrate} from './Hydrate.svelte';
export {hydrate} from './hydrate'
export {addPage} from './pages';

// some helper components
/**
 * Portal like component. Slot content is hydrated into the prop 
 * 'element'
 */
export {default as Claim} from './claim'
/**
 * This is a client-side-only component. It hydrates a given tag and keeps all the 
 * children without handling them. If an id is provided, it infers the tag 
 * when hydrated. Slot is rendered into a disconnected dummy element.
 */
export {default as Take} from './take';
