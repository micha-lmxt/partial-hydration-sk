import type { SvelteComponent, SvelteComponentDev } from "svelte/internal";

export let Pages: { [key: string]: any } = {};

export function addPage<T extends typeof SvelteComponent| typeof SvelteComponentDev>(...args:
    ([staticPage: { name: string, page: T }] | [page: T, name: string])) {
    if (args[1]) {
        Pages[args[1]] = args[0];
    } else {
        const a = args[0] as { name: string, page: T };
        Pages[a.name] = a.page;
    }
}

let memo = {url:"-1",html:Promise.resolve(undefined) as Promise<Document|undefined>,p:undefined as DOMParser|undefined}
export function fetchHTML(url:string){
    if (memo.url === url){
        return memo.html;
    }
    if (!memo.p){
        memo.p= new DOMParser();
    }
    memo.url = url;
    memo.html = fetch(url)
        .then(v => v.text())
        .then(v => memo.p!.parseFromString(v, "text/html"));
    return memo.html;
}