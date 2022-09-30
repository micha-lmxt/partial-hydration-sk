/* Component3.svelte generated by Svelte v3.50.1 */
import { create_ssr_component, validate_component } from "svelte/internal";

import Hydrate from './Hydrate.svelte';
 
/**
 * 
 * @param C The svelte component to hydrate
 * @param allowSlot Does the component support static slot content
 * @param tag The wrapping tag type
 * @param slotTag The wrapping tag type of slotted content
 * @returns 
 */
export function hydrate(C:any,allowSlot=true,tag="x",slotTag:"x",props=undefined) {
    if (allowSlot){
    return create_ssr_component(($$result:any, $$props:any, $$bindings:any, slots:any) => {
        return `${validate_component(Hydrate, "Hydrate").$$render($$result, { component: C , tag, slotTag, props}, {}, {
            default: () => {
                return `${slots.default ? slots.default({}) : ``}`;
            }
        })}`;
    });
    }
    return create_ssr_component(($$result:any, $$props:any, $$bindings:any, slots:any) => {
        return `${validate_component(Hydrate, "Hydrate").$$render($$result, { component: C , tag, slotTag, props}, {}, {})}`;
    });
};