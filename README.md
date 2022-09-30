# partial-hydration-sk

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

In addition, you need to tell the 'PartialApp' component, that you intend to hydrate your Component:

```svelte
<script lang="ts">
    import {PartialApp} from 'partial-hydration-sk';
    import YourHydratableComponent from '.../YourHydratableComponent.svelte'
</script>
<PartialApp tag="div" id="appstart" page="YourStaticComponent" starts={[YourHydratableComponent]}/>
```

## Example

You can find an example app here:

https://github.com/micha-lmxt/sveltekit-partial-hydration-template
