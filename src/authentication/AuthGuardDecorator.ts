import { container } from "tsyringe";

import { SecurityContext } from "./SecurityContext";

export const AuthGuard = (): MethodDecorator => (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
) => {
    const originalMethod = descriptor.value;
    descriptor.value = function(args: any) {
        const securityContext = container.resolve(SecurityContext);
        securityContext.requireAuthenticatedUser(args.headers);
        const newArgs = {
            ...args,
            securityContext
        };
        return originalMethod.call(this, newArgs);
    };
};
