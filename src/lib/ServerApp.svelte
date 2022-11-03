<script lang="ts">
    import {Lazys} from './pages';
    import {setContext,getContext} from 'svelte'
    import {hydrateContext} from './context';
    import CSSCollect from './cssCollect';
    export let tag="div",id,page,props={},starts=[],hydrated;
    hydrated=false;
    
    const otherContext = getContext(hydrateContext);
    if (otherContext && Array.isArray(otherContext)){
        throw new Error("Try to launch nested PartialApp: " + id);
    }
    setContext(hydrateContext, starts.concat(Lazys));
</script>

<svelte:element this={tag} {id} class="staticapp" >
<CSSCollect {props} {page}/>
</svelte:element>
<style>
    .staticapp{
        display:contents;
    }
</style>
