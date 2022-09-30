export const findHydrationTags = (app:Element|SVGElement)=>{
    
    const result : {componentID:number,props?:any,el:Element,slotId?:string}[] = [];
    //const ch = Array.from(app.children);

    const recCheck = (el:(Element|SVGElement)&{dataset:object}) =>{
        
        if ("hydrateStart" in el.dataset){
            result.push(
                {componentID:parseInt(el.dataset.hydrateStart!),
                    props:el.dataset.props?JSON.parse(el.dataset.props):undefined,
                    el,
                    slotId:el.dataset.hasSlot
                })
        }else{
            Array.from(el.children).forEach(v=>recCheck(v as any));
        }
    }    
    recCheck(app as any);
    return result;
}
