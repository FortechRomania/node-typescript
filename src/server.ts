import "reflect-metadata";

import { default as express, Express, Router} from "express";
import { container, injectable } from "tsyringe";
import { ConfigService, IConfig } from "./config/ConfigService";
import { RouterService } from "./router/RouterService";

@injectable()
class Server {
    private app: Express;
    private config: IConfig;

    constructor(
        private configService: ConfigService,
        private router: RouterService,
    ) {
        this.config = this.configService.getConfig();
        this.app = express();
        this.router.configureRoutes({app: this.app, expressRouter: Router()});
        this.startApp();
     }

    private startApp = (): void => {
        const { app } = this;
        app.listen(this.config.port, () => console.info(`App started on port *:${this.config.port}`));
    }
}
container.resolve(Server);
