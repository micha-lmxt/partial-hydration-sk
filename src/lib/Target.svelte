<script lang="ts">
    export let Component,
        props:Writable<undefined|object>
    const C = Component;
</script>
<C {...( $props || {})}>
<slot/>
</C>
