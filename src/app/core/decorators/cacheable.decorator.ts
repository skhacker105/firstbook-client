import { of, tap } from "rxjs";
import { ICacheableConfig } from "../models/cacheable-config";

export const HTTPCacheable = (config?: ICacheableConfig): MethodDecorator => {
    return (() => {
        let result: any = {};
        config?.refresher?.subscribe(res => result = {} );
        return (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
            const originalMethod = descriptor.value;
            descriptor.value = function (...args: any) {
                const argStr = JSON.stringify(args);
                if (result[argStr]) return of(result[argStr]);
                else return originalMethod.apply(this, args).pipe(tap((res) => result[argStr] = res));
            };
            return descriptor;
        };
    })();
};

export const HTTPCacheBuster = (config?: ICacheableConfig): MethodDecorator => {
    return (() => {
        return (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
            const originalMethod = descriptor.value;
            descriptor.value = function (...args: any) {
                config?.refresher?.next(true);
                return originalMethod.apply(this, args);
            };
            return descriptor;
        };
    })();
};