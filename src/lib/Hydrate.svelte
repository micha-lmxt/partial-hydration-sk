<script lang="ts">
    import {getContext, setContext} from 'svelte';
    import {hydrateContext} from './context';
    import PartialApp from './partialApp';
    import {browser} from '$app/environment';
    import StaticSlot from './ServerStaticSlot.svelte';

    export let tag="x",
        props=undefined,
        component=undefined,
        slotTag="x";
    const comps : any[] = getContext(hydrateContext);
    // check if this is child of a PartialApp component
    const noHydration = !comps || comps==="nested";
    setContext(hydrateContext,"nested");
    let index = -1;
    if (!noHydration){
        index = comps.findIndex(v=>v===component);
    }
    let slotid=$$slots.default?crypto.randomUUID():undefined
</script>

<svelte:element this={tag} data-hydrate-start={noHydration?undefined:index} data-has-slot={slotid} data-props={props && !noHydration?JSON.stringify(props):undefined}>
    <svelte:component this={component} {...props||{}}>
    {#if $$slots.default}
    <StaticSlot tag={slotTag} context={comps} id={slotid}>
        <slot/>
    </StaticSlot>
    {/if}
    </svelte:component>
</svelte:element>
