import { setDynamicComponents } from "$lib/pages";
import T from '$lib/page/Test.svelte';
export const prerender=true;
export async function load(){
        
    setDynamicComponents([async()=>(await import('$lib/page/Test.svelte')).default])
}