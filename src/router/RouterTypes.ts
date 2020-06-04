import { HTTPResponse } from "./HTTPResponse";

export type RequestMethods = "all" | "get" | "post" | "put" | "delete" | "patch";

export interface Controller {
    [key: string]: ({ body: string }) => void | object | HTTPResponse;
}

export interface MethodMetadata {
    requestMethod?: RequestMethods;
    path?: string;
    "design:type"?: any;
}

export interface ControllerMetadata {
    path?: string;
    isRestController: boolean;
}
