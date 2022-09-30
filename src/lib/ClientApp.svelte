<script lang="ts">
    import Take from './take'
    import Claim from './claim';
    import { findHydrationTags } from "./utils";
    import {onMount} from 'svelte';
    import { page as _page } from '$app/stores';
    import { get } from "svelte/store";
    import { fetchHTML } from "./pages";

    export let tag="x",id,props=undefined,starts=[],page="";
    let root : Element;
    let childList:{el:Element,component:SvelteComponent} = [];
    onMount(()=>{
        let htmlLoaded = Promise.resolve(true);
        if (!root.id){
            //if the root does not have id, it is newly created and the html needs to
            // be fetched.
            root.id=id;
            const url = get(_page).url.href;
            htmlLoaded = fetchHTML(url).then(htmldoc=>{
						if (!htmldoc)
							return false
						const d = htmldoc.getElementById(id);
						root.innerHTML = d?.innerHTML;
						return true; 
					});
        }
        //only try to find children if hydration starts are defined
        if (starts.length>0){
            htmlLoaded.then(v=>{
                const toHydrate = findHydrationTags(root);
                childList = toHydrate.map(v => ({ component: starts[v.componentID], props: v.props, el: v.el,slotId:v.slotId }))
            })
        }
    })
</script>
<Take {tag} bind:element={root} {id}>
    {#each childList as Child(Child.el)}
        <Claim element={Child.el}>
            {#if Child.slotId}
                <Child.component {...(Child.props||{})}>  
                    <svelte:self id={Child.slotId} {starts}/> 
                </Child.component>
            {:else}
                <Child.component {...(Child.props||{})}/>
            {/if}
        </Claim>
    {/each}
</Take>