# partial-hydration-sk

[Live demo with adapter-static](https://partial-hydration.gradientdescent.de)

Add partial hydration to your SvelteKit pages. It means that some parts of your page are only
prerendered or rendered by the server. These parts are static, it won't change due to user interaction.
This can be useful when:

 - large parts of your app are static and only few parts need javascript
 - rendering is expensive and can be performed only at server, eg. processing markdown files to html  

## Installation


```bash
npm i --save-dev partial-hydration-sk
```

## Developing

You manually decide, which parts of your page are static and which parts need hydration.
Static components need to be registered in server-side code. I'd recommend to add a file
'+page.server.js', if you don't have one yet. In the 'load' function register the static 
Component:

```javascript
import YourStaticComponent from '$lib/.../YourStaticComponent.svelte';
import {addPage} from 'partial-hydration-sk';

export async function load(){
    addPage({page:YourStaticComponent,name:"YourStaticComponent");
}
```

Somewhere in your dynamic page, usually in the '+page.svelte', you can load the static code:
```svelte
<script lang="ts">
    import {PartialApp} from 'partial-hydration-sk';
</script>
<PartialApp tag="div" id="appstart" page="YourStaticComponent"/>
```

Note that "YourStaticComponent" is referenced by the name you've put in the 'addPage' function, it is not imported here.

### Adding Hydration

Inside the static component, you can decide to add hydratable content. This would go into a separate 
Component and is wrapped into the 'Hydrate' component.

```svelte
<!--inside YourStaticComponent.svelte-->
<script>
    import YourHydratableComponent from '.../YourHydratableComponent.svelte'
    import {Hydrate} from 'partial-hydration-sk';
</script>

...
    <Hydrate component={YourHydratableComponent}>
        <SomeMoreStaticCode>
    </Hydrate>
...
```

In addition, you need to tell the 'PartialApp' component, that you intend to hydrate your Component. There are two ways to do this:

#### 1. +page.js

Register the component via the 'setDynamicComponents' function, eg. in 'load':

```js
import {setDynamicComponents} from 'partial-hydration-sk'
    import YourHydratableComponent from '.../YourHydratableComponent.svelte'
export async function load(){
    setDynamicComponents([YourHydratableComponent])
}
```
'setDynamicComponents' accepts an array of SvelteComponents and functions, see lazy loading below.

#### 2. Props

The 'PartialApp' component accepts a prop 'start':
```svelte
<script lang="ts">
    import {PartialApp} from 'partial-hydration-sk';
    import YourHydratableComponent from '.../YourHydratableComponent.svelte'
</script>
<PartialApp tag="div" id="appstart" page="YourStaticComponent" starts={[YourHydratableComponent]}/>
```

### Advanced Props Handling

You can only pass serializable (JSON.stringify) into the prop 'props' to the 'Hydrate' component. If you need more complex props, eg. if you want to put a function as prop, you can retrieve a store to the props from the 'PartialApp' component. Pass a unique key to the Hydrate component, so that you can retrieve the props: 

```svelte
<!-- +page.js -->
<script>
    import {PartialApp} from 'partial-hydration-sk'

    let hydrated,
        hydratedChildProps
    $: if (hydrated){
        const hydratedChild = hydrated.find(v=>v.key==="mykey");
        if (hydratedChild){
            hydratedChildProps = hydratedChild.props;
            hydratedChildProps.update(v=>({...v,someFunctionProp:()=>{...}}))
        }
    }
</script>
...
    <PartialApp bind:hydrated>
...
```

```svelte
<!-- SomeStatic.svelte -->
...
<Hydrate key="mykey" ...>
```

### Lazy Loading

You can delay the download of code and hydration. To do that, the array argument of the function 'setDynamicComponents' also accepts functions, which return a Promise<SvelteComponent>:

```javascript
import { setDynamicComponents } from 'partial-hydration-sk/pages';

export async function load(){
    setDynamicComponents(
        [
            async () => (await import('../LazyLoadedComponent.svelte')).default
        ])
}
```

In the static component, you can import the component directly:

```svelte
<!--inside YourStaticComponent.svelte-->
<script>
    import LazyLoadedComponent from '.../LazyLoadedComponent.svelte'
    import {Hydrate} from 'partial-hydration-sk';
</script>

...
    <Hydrate component={LazyLoadedComponent} trigger="observer" key="mylazy">
        <SomeMoreStaticCode>
    </Hydrate>
...
```

If you omit the trigger prop or set it to "observer", the import and hydration is triggered by an intersection observer. Once the surrounding element is visible, it is hydrated. 

#### Custom Trigger

Alternatively, you can set the 'trigger' prop to '"custom"'. Then you should also pass a unique key and retrieve a trigger function from the 'PartialApp' component. You can also retrieve a reference to the surrounding element, so that you can attach listeners to it.

```svelte
<!-- +page.js -->
<script>
    import {PartialApp} from 'partial-hydration-sk'

    let hydrated,
        hydratedChildProps
        first = true;
    $: if (hydrated){
        const hydratedChild = hydrated.find(v=>v.key==="mykey");
        if (first && hydratedChild){
            first = false;
            hydratedChild.element.onclick = hydratedChild.element.trigger;
        }
    }
</script>
...
    <PartialApp bind:hydrated page="staticpage">
...
```


## Example

You can find an example app here:

https://github.com/micha-lmxt/sveltekit-partial-hydration-template

[Live demo with adapter-static](https://partial-hydration.gradientdescent.de)

