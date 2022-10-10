<script lang="ts">
    export let Component,
        props:Writable<undefined|object>
</script>
<Component {...( $props || {})}>
<slot/>
</Component>
