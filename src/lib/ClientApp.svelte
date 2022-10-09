<script lang="ts">
    import Take from './take'
    import Claim from './claim';
    import { findHydrationTags } from "./utils";
    import {onMount} from 'svelte';
    import { page as _page } from '$app/stores';
    import { get } from "svelte/store";
    import { fetchHTML, Lazys } from "./pages";
    import {intersect} from './intersection'
    import {SvelteComponent,SvelteComponentDev} from 'svelte/internal';

    export let tag="x",id,props=undefined,starts=[],page="",
        hydrated={} as {key:string,trigger?:()=>void,element:Element};
    let root : Element;
    let childList:{el:Element,component:SvelteComponent} = [];
    let lazys : (()=>any)[] = [];

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
                        
						root.innerHTML = d?.innerHTML
						return true; 
					});
        }
        //only try to find children if hydration starts are defined
        if (starts.length>0||Lazys.length>0){
            htmlLoaded.then(v=>{
                const toHydrate = findHydrationTags(root);
                const allFound = toHydrate.map(v => ({ component: v.componentID<starts.length?starts[v.componentID]:Lazys[v.componentID]
                    , props: v.props, el: v.el,slotId:v.slotId }))
                const checkIsSvelte = (v)=>v.prototype && ("constructor" in v.prototype);
                childList = allFound.filter( v=> checkIsSvelte(v.component));
                lazys = allFound.filter( v=> !checkIsSvelte(v.component));
                intersect(lazys.map(v=>v.el),loadLazy)
            })
        }
    })
    const loadLazy = async (el) => {
        const row = lazys.find(v=>el === v.el);
        if (!row)return;
        const comp = await row.component();
        childList = [...childList,{...row,component:comp}];
        lazys = lazys.filter(v=>el !== v.el);

    }

    
    
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