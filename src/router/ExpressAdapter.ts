import { container, InjectionToken, singleton } from "tsyringe";
import { ConfigService, IConfig } from "../config/ConfigService";
import { Controller, ControllerMetadata, MethodMetadata } from "./RouterTypes";

import { default as express, Express, NextFunction, Request, RequestHandler, Response, response } from "express";
import { ErrorService } from "../error/ErrorService";
import { HTTPResponse } from "./HTTPResponse";

import * as bodyParser from "body-parser";
import { default as urlJoin } from "url-join";

@singleton()
export class ExpressAdapter {
    private app: Express;
    private config: IConfig;
    private controllers: InjectionToken[];

    constructor(private configService: ConfigService, private errorService: ErrorService) {
        this.config = this.configService.getConfig();
        this.app = express();
    }

    public ejectRouter() {
        return this.app;
    }

    public addControllers(controllers: InjectionToken[]): void {
        this.controllers = controllers;
    }

    public build(): void {
        this.config = this.configService.getConfig();
        this.app = express();
        this.startApp();
        this.addExpressMiddlewares();
        this.registerControllers();
        this.addErrorHandling();
    }

    private registerControllers() {
        for (const controller of this.controllers) {
            this.registerController(controller);
        }
    }

    private addExpressMiddlewares() {
        this.app.use(bodyParser.json());
    }

    private registerController(controller: any | InjectionToken): void {
        const controllerMetadata: ControllerMetadata = this.getMetadataObject<ControllerMetadata>(controller);
        if (!controllerMetadata.isRestController) {
            throw new Error(
                `Skipped '${controller.name}'! Controllers not marked with the RestController decorator will throw an error`
            );
        }
        const controllerInstance: Controller = <Controller>container.resolve(controller);
        for (const methodName in controllerInstance) {
            const methodMetadata: MethodMetadata = this.getMetadataObject<MethodMetadata>(
                controllerInstance,
                methodName
            );
            this.attachMethodToExpress(controllerInstance, controllerMetadata, methodName, methodMetadata);
        }
    }

    private attachMethodToExpress(
        controllerInstance: Controller,
        controllerMetadata: ControllerMetadata,
        methodName: string,
        methodMetadata: MethodMetadata
    ): void {
        const methodMetadataHasErrors = this.checkMethodMetadata(methodName, methodMetadata);
        if (methodMetadataHasErrors) {
            return;
        }
        const controllerMethod = controllerInstance[methodName];
        const expressHandler = this.getExpressHandler(controllerInstance, controllerMethod);
        const url = urlJoin(controllerMetadata.path, methodMetadata.path);
        this.app[methodMetadata.requestMethod](url, expressHandler);
        console.info(`Added route ${methodMetadata.requestMethod.toUpperCase()} ${url}`);
    }

    private getExpressHandler(controllerInstance: Controller, controllerMethod: Controller[any]): RequestHandler {
        return (req: Request, res: Response, next: NextFunction): void => {
            const methodArguments = {
                ...req.params,
                ...req.body,
                body: req.body,
                headers: req.headers || {}
            };

            (async () => {
                try {
                    const responseObject = await controllerMethod.call(controllerInstance, methodArguments);
                    if (responseObject instanceof HTTPResponse) {
                        res.status(responseObject.status)
                            .set(responseObject.headers)
                            .json(responseObject.body);
                        return;
                    }
                    if (!responseObject) {
                        res.status(204).send();
                        return;
                    }
                    res.status(200).json(responseObject);
                } catch (e) {
                    next(e);
                }
            })();
        };
    }

    private checkMethodMetadata(methodName: string, methodMetadata: MethodMetadata): boolean {
        if (methodMetadata["design:type"] !== Function) {
            return true;
        }
        if (!methodMetadata.path) {
            throw new Error(`The method "${methodName}" doesn't have any path attached. Use the @Path decorator.`);
        }
        if (!methodMetadata.requestMethod) {
            throw new Error(
                `The method "${methodName}" doesn't have any request method attached. Use the @RequestMethod decorator.`
            );
        }
        return false;
    }

    private startApp(): void {
        const { app } = this;
        app.listen(this.config.port, () => console.info(`App started on port *:${this.config.port}`));
    }

    private addErrorHandling(): void {
        this.app.all("**", () => {
            throw this.errorService.getErrorMessage(10);
        });
        this.app.use((err: any, _req: any, res: any, _next: any) => {
            const error = err.statusCode ? err : this.errorService.getErrorMessage(0);
            return res.status(error.statusCode).json(error);
        });
    }

    private getMetadataObject<T>(...targetKeys: [object, (string | symbol)?]): T {
        const metadataKeys = Reflect.getMetadataKeys(...targetKeys);
        return <T>metadataKeys.reduce(
            (metadata, metadataKey: string) => ({
                ...metadata,
                [metadataKey]: Reflect.getMetadata(metadataKey, ...targetKeys)
            }),
            {}
        );
    }
}
