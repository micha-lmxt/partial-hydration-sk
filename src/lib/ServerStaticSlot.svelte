<script lang="ts">
    import {setContext} from 'svelte'
    import {hydrateContext} from './context';
    
    export let tag,context=[],id;
    
    setContext(hydrateContext, context);
</script>

<svelte:element this={tag} {id}>
    <slot/>
</svelte:element> 