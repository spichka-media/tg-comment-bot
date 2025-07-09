export function makeDeferredPromise() {
    const defPromise = {
        promise: undefined,
        resolve: undefined
    } as any;

    defPromise.promise = new Promise(resolve => {
        defPromise.resolve = resolve;
    });

    return defPromise;
}