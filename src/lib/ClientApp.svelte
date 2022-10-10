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
    import Target from './Target.svelte';
    import {writable} from 'svelte/store'

    export let tag="div",id,props=undefined,starts=[],page="",
        hydrated=[] as {
            key?:string,
            trigger?:()=>void,
            element:Element,
            loaded:boolean,
            props:Writable<object>
        }[];
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
                    , props: writable(v.props), el: v.el,slotId:v.slotId, key: v.key }))
                // TODO: make this better    
                const checkIsSvelte = (v)=>v.prototype && ("constructor" in v.prototype);
                
                hydrated = allFound.map(
                    w => ({
                        element: w.el,
                        props: w.props,
                        loaded: checkIsSvelte(w.component),
                        key: w.key,
                        trigger: w.trigger === "1" ? 
                            ()=>loadLazy(w.el):undefined
                    })
                )
                childList = allFound.filter( v=> checkIsSvelte(v.component));
                lazys = allFound.filter( v=> !checkIsSvelte(v.component));
                intersect(lazys.filter(v=>v.trigger!=="1").map(v=>v.el),loadLazy)
            })
        }
    })

    const loadLazy = async (el) => {
        const row = lazys.find(v=>el === v.el);
        if (!row)return;
        const comp = await row.component();
        childList = [...childList,{...row,component:comp}];
        lazys = lazys.filter(v=>el !== v.el);
        hydrated = hydrated.map(v=>v.el===el ?{...v,loaded:true,trigger:undefined} :v);
    }

</script>
<Take {tag} bind:element={root} {id}>
    {#each childList as Child(Child.el)}
        <Claim element={Child.el}>
            {#if Child.slotId}
                <Target Component={Child.component}
                props={Child.props}>  
                    <svelte:self id={Child.slotId} {starts}/> 
                </Target>
            {:else}
                <Target Component={Child.component}
                props={Child.props}/>
            {/if}
        </Claim>
    {/each}
</Take>