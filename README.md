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
import {addPage} from 'partial-hydration-sk/server';

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

## Limitations

Currently Svelte style tags work in static components. The styles are gathered and added inside a style tag within the body of the html file.

## Example

You can find an example app here:

https://github.com/micha-lmxt/sveltekit-partial-hydration-template

[Live demo with adapter-static](https://partial-hydration.gradientdescent.de)

## How it works

There are a few cases to distinguish. It starts with the entry component, the `PartialApp`.
Via the '$app/environment'-browser flag it returns very different components for the ssr and the browser, namely ServerApp.svelte and ClientApp.svelte. Let's start with the server.

### ServerApp.svelte

> since v.1.3.0 there is a wrapper component for the ServerApp, which is called ServerAppWrap.svelte. this only makes sure, that the Server code is not sent to the client.

This component takes executes the ssr-code of the component. You added this component in the `page.server.js` (or `.ts`) with `addPage` and it is handed over to the `ServerApp` by a global js object. The html result is wrapped in a tag of your choice which gets an unique id of your choice. The unique id is important, since this wrapper tag is searched by the client code. Also, a context is set so that the following cases can be handled:

- A `PartialApp` is called as a child of `PartialApp` (meaning with-in static code): throws an error
- A `Hydrate` is called without being child of a `PartialApp` or as a descendant of another `Hydrate` component: hydration is not necessary

This is nearly all the `PartialApp` does on the server. There is a little more, because Svelte scoped `<style>`-tags are not transformed to css files for static components. I explain that below.

#### Hydrate.svelte and hydrate function

The purpose of the Hydrate component is to execute the ssr code for the components, which you want to hydrate. The code is also wrapped in an html element with a tag of your choice. The necessary information for hydration is added to this element using `data-` properties. The hydratable components are stored in an array, and the `data-hydrate-start` property has the index, of this component. The props are transmitted via `data-props`, that's why they need to be serializable. 

`Hydrate` components can have slots, the slot content is wrapped in another element. This element is treated as another `PartialApp` entry tag by the client code. A unique id is generated automatically. This id is sent to `data-has-slot` property of the hydrate element.

The `hydrate` function is a wrapper around the `Hydrate` component. Currently it only works for ssr.

### ClientApp.svelte

In the browser, the `PartialApp` does completely different things. There are two cases to distinguish:

1. ssr: the site is accessed directly, eg. the exact url of the page is typed in the browser
2. client navigation: the user navigates from a different page within the SvelteKit app to this page.

#### Take

In the first case, the page is prerendered, so a complete html tree is already there and Svelte asks the `PartialApp`/`ClientApp` component to hydrate into this tree. The `Take` component (`take.ts`) is hydrating the wrapping element and ignoring its inner content, meaning it is neither hydrating nor removing anything.

In the second case, the page needs to be created by client code. The `Take` component creates a wrapping html element and returns some hint to the `ClientApp`, that inner content is missing. The `ClientApp` starts a `fetch` call in `onMount` to the same url, which returns the server rendered html file. This is parsed to a document tree and an element with the supplied unique id is searched. The innerHTML of the found element is attached to `Take`s newly created wrapping element. 

In both cases, the slot content of the `Take` component is created and mounted to a `dummy` html element outside of the actual document tree. 

Then, the innerHTML of the `Take` components wrapping element is searched for hydration tags. By that I mean tags, which have the `data-hydrate-start` property. Such a descendant is put either in the `childList` or the `lazys` list. An element from the `lazys` list is transferred over to the `childList`, once the corresponding trigger is called. 

#### Claim

Elements from the `childList` are passed to the `Claim` component (`claim.ts`). This is a portal-like component. It redirects its slot content to hydrate into the inner content of the passed element.  

#### Target.svelte

The `Target` component is in the slot of the `Claim` and this is where the hydration component is loaded. It can have a slot. If so, the slot is treated as a `PartialApp`/`ClientApp`.

### Style Tags in static code

SvelteKit doesn't create .css files from `<style>` tags for static code. I'm not really sure why, but that is how it is. So, a workaround is in place. During server-side-rendering not only the html code is generated, but also the css code is collected via the `$$result` variable. Basicly the workaround is to combine the css code and fit it into a `style` tag, which is a direct child to the wrapping element of the `PartialApp`. The `CssCollect` components (`cssCollect.ts`) does exactly that. There is also the `CssTagging` component (`cssTagging.ts`), which filters out the css chunks, that are generated by hydrated code. This makes sure, that only static css code is put into the `style` tag.

