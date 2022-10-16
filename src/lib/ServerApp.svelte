<script lang="ts">
    import {Pages,Lazys} from './pages';
    import {setContext,getContext} from 'svelte'
    import {hydrateContext} from './context';
    export let tag="div",id,page,props={},starts=[],hydrated:[];
    const Page = Pages[page];
    const otherContext = getContext(hydrateContext);
    if (otherContext && Array.isArray(otherContext)){
        throw new Error("Try to launch nested PartialApp: " + id);
    }
    setContext(hydrateContext, starts.concat(Lazys));
</script>

<svelte:element this={tag} {id} >
<svelte:component this={Page} {...props}/>
</svelte:element> 
