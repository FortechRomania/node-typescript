import { container } from "tsyringe";

export interface Server {
    controllers: any[];
    adapter: any;
}

export const Server = (metadata: Server): ClassDecorator => {
    return (): void => {
        if (!metadata.adapter) {
            throw new Error("The app couldn't start. Please select an adapter.");
        }
        const adapterInstance: any = container.resolve(metadata.adapter);
        if (!adapterInstance.addControllers) {
            throw new Error("The method 'addControllers' is missing from the added adapter");
        }
        if (!adapterInstance.build) {
            throw new Error("The method 'build' is missing from the added adapter");
        }
        adapterInstance.addControllers(metadata.controllers);
        adapterInstance.build();
    };
};
