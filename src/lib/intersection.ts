export const intersect = (els: Element[], cb: (el: Element) => void) => {
    let options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.0
    }

    let observer = new IntersectionObserver(
        (entries) => {
            console.log(entries)
            entries.forEach(
                v => {
                    if (v.isIntersecting){
                        cb(v.target)
                        observer.unobserve(v.target)
                    }
                }
            )
        }, options);
    els.forEach(v =>
        observer.observe(v)
    );
}