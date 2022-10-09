import { addPage } from "$lib";
import Static from '$lib/page/Static.svelte';

export const prerender=true;

export async function load(){
    addPage({page:Static,name:"Static"})
}