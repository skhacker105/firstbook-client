import { Observable, of, tap } from "rxjs";

export const HTTPResponseCache = (): MethodDecorator => {
    return (() => {
        let result: any;
        return (target: Object, propertyKey: string | symbol, descriptor: any) => {
            const originalMethod = descriptor.value;
            descriptor.value = function()  {
                if (result) {
                  console.log('Returning from cache');
                  return of(result);
                }
                console.log('Calling Api');
                return originalMethod.apply(this).pipe(tap((res) => result = res));
              };
            return descriptor;
        }
    })();
};