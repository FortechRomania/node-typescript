import { RequestMethods } from "./RouterTypes";

export const RestController = (path: string): ClassDecorator => (target: any) => {
    Reflect.defineMetadata("path", path, target);
    Reflect.defineMetadata("isRestController", true, target);
};

export const Path = (path: string): MethodDecorator => (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
) => {
    descriptor.enumerable = true;
    Reflect.defineMetadata("path", path, target, propertyKey);
};

export const RequestMethod = (method: RequestMethods): MethodDecorator => (
    target: any,
    propertyKey: string | symbol
) => {
    Reflect.defineMetadata("requestMethod", method, target, propertyKey);
};
