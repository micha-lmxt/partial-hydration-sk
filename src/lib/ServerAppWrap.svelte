<script context="module">
export const PartialApp = {app:undefined}
</script>
<script>
    export let tag="div",id,page,props={},starts=[],hydrated;
</script>
{#if PartialApp.app}
    <PartialApp.app {tag} {id} {page} {props} {starts} {hydrated}/> 
{/if}