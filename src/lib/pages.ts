import type { SvelteComponent, SvelteComponentDev, } from "svelte/internal";
import { browser } from "$app/environment";
import { PartialApp } from "./ServerAppWrap.svelte";
import ServerApp from './ServerApp.svelte';

PartialApp.app = ServerApp;
export let Lazys: any[] = []

export async function setDynamicComponents(components: ((typeof SvelteComponent) | (typeof SvelteComponentDev) | (() => Promise<(typeof SvelteComponent) | (typeof SvelteComponentDev)>))[]) {
    if (browser) {
        Lazys = components;
    } else {
        Lazys = await Promise.all(components.map(v => ("$$render" in v) ? v : (v as any)()))
    }
}

let memo = {
    url: "-1",
    html: Promise.resolve(undefined) as Promise<Document | undefined>, p: undefined as DOMParser | undefined
}
export function fetchHTML(url: string) {
    if (memo.url === url) {
        return memo.html;
    }
    if (!memo.p) {
        memo.p = new DOMParser();
    }
    memo.url = url;
    memo.html = fetch(url)
        .then(v => v.text())
        .then(v => memo.p!.parseFromString(v, "text/html"));
    return memo.html;
}