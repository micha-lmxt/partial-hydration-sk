import type { SvelteComponent, SvelteComponentDev, } from "svelte/internal";


export let Pages: { [key: string]: any } = {};

export function addPage<T extends typeof SvelteComponent | typeof SvelteComponentDev>(...args:
    ([staticPage: { name: string, page: T }] | [page: T, name: string])) {
    
    if (args[1]) {
        Pages[args[1]] = args[0];
    } else {
        const a = args[0] as { name: string, page: T };
        Pages[a.name] = a.page;
    }
}