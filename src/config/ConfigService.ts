import { singleton } from "tsyringe";

export interface IConfig {
    port: number;
    environment: string;
    saltRounds: number;
    privateKey: string;
}

@singleton()
export class ConfigService {
    private config: IConfig;

    constructor() {
        const { environment } = process.env;
        this.config = {
            port: Number(process.env.PORT) || 3000,
            environment: environment || "DEVELOPMENT",
            saltRounds: 10,
            privateKey: "fake key"
        };
    }
    public getConfig(): IConfig {
        return this.config;
    }
}
