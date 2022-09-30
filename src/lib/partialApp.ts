import ClientApp from './ClientApp.svelte'
import ServerApp from './ServerApp.svelte'
import {browser} from '$app/environment';
import type { SvelteComponent, SvelteComponentTyped } from 'svelte';
export interface PartialHydrationProps{
    /**
     * The static code will be wrapped in a html element. Choose the tag.
     */
    tag?:string,
    /**
     * A unique id needs to be provided, which is passed to the html file
     */
    id:string,
    /**
     * The static app can receive props.
     */
    props?:object,
    /**
     * The list of components, which should be hydrated. They need to be listed here and also wrapped
     * either with 'Hydrate' component or 'hydrate' function. 
     */
    starts?:SvelteComponent[],
    /**
     * The mapped name of the static component that should be loaded. 
     * Map in server-side code (eg. +page.server.js, load funciont)
     * via 'addPage'
     */
    page:string
}

/**
 *  * The main entry for static code. Prop 'page' must be a string which is
 * associated with a Svelte component. This must be loaded in server 
 * side code, eg. in the load function in +page.server.js via the 
 * addPage functionality. 'starts' is an array of all Svelte components
 * which are are hydrated. They still need to be wrapped with either 
 * 'hydrate' function or 'Hydrate' coponenent. 

 */
export type PartialHydration = typeof SvelteComponentTyped<PartialHydrationProps,{},{}>

const App = (browser ? 
    ClientApp :
//    (await import('./serverApp.js')).default;
    ServerApp) as unknown as PartialHydration;

export default App;
