<script lang="ts">
    import {getContext, setContext} from 'svelte';
    import {hydrateContext} from './context';
    import {browser} from '$app/environment';
    import StaticSlot from './ServerStaticSlot.svelte';
    import CssTagging from './cssTagging';

    export let tag="div",
        props=undefined,
        component=undefined,
        slotTag="div",
        key="",
        trigger="" as ""|"observer"|"custom";
    const comps : any[] = getContext(hydrateContext);
    // check if this is child of a PartialApp component
    const noHydration = !comps || comps==="nested";
    setContext(hydrateContext,"nested");
    let index = -1;
    if (!noHydration){
        index = comps.findIndex(v=>v===component);
    }
    let slotid=$$slots.default?crypto.randomUUID():undefined
    const trig = (!trigger || trigger==="observer") ? undefined :
        "1"
</script>

<svelte:element
this={tag} 
data-hydrate-start={noHydration?undefined:index} 
data-has-slot={slotid} 
data-props={props && !noHydration?JSON.stringify(props):undefined}
data-key={key?key:undefined}
data-trigger={trig}
>
    {#if browser}
    <svelte:component this={component} {...(props||{})}>
        <slot/>
    </svelte:component>
    {:else}
        {#if $$slots.default}
            <CssTagging {component} {props}>
                <StaticSlot tag={slotTag} context={comps} id={slotid}>
                    <slot/>
                </StaticSlot>
            </CssTagging>
        {:else}
            <CssTagging {component} {props}/>
        {/if}
    {/if}
</svelte:element>
