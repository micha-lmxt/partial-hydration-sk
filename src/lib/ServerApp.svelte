<script lang="ts">
    import {Pages} from './pages';
    import {setContext,getContext} from 'svelte'
    import {hydrateContext} from './context';
    export let tag,id,page,props={},starts=[];
    const Page = Pages[page];
    const otherContext = getContext(hydrateContext);
    if (otherContext && Array.isArray(otherContext)){
        throw new Error("Try to launch nested PartialApp: " + id);
    }
    setContext(hydrateContext, starts);
</script>

<svelte:element this={tag} {id} >
<svelte:component this={Page} {...props}/>
</svelte:element> 