import {singleton} from "tsyringe";

export interface IConfig {
    port: number;
}

@singleton()
export class ConfigService {

    private config: IConfig;

    constructor() {
        this.config = {
            port: 3000,
        };
    }
    public getConfig(): IConfig {
        return this.config;
    }
}
