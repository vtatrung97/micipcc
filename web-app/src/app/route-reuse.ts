import {
    ActivatedRouteSnapshot,
    DetachedRouteHandle,
    RouteReuseStrategy,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
    private routeStore = new Map<string, DetachedRouteHandle>();
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // @ts-ignore
        if (route.data.shouldReuse != true){
            this.routeStore.clear();
        }
        // @ts-ignore
        return route.data.shouldReuse;
    }
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        // @ts-ignore
        this.routeStore.set(route.routeConfig.path, handle);
    }
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // @ts-ignore
        const path = route.routeConfig.path;
        return (
            // @ts-ignore
            route.data.shouldReuse && !!this.routeStore.get(path)
        );
    }
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        // @ts-ignore
        const path = route.routeConfig.path;
        // @ts-ignore
        return this.routeStore.get(path);
    }
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}
