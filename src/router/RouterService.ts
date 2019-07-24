import { injectable } from "tsyringe";
import { Router, Express } from "express";
import { RouterAdapter } from "./RouterAdapter";
import { ErrorService } from "../error/ErrorService";
import { Routes } from "../routes";

@injectable()
export class RouterService {

    constructor(private routerAdapter: RouterAdapter, private errorService: ErrorService) {}

    public configureRoutes = ({app, expressRouter}: {app: Express, expressRouter: Router}): void => {
        const { buildRoute } = this.routerAdapter;
        for(const {basePath, router: Router} of Routes){
          buildRoute({basePath, Router, app, expressRouter});
        }
        app.use((err: any, _req:any, res:any, _next:any)=> {
          const error = err.statusCode ? err : this.errorService.getErrorMessage(0);
          return res.status(error.statusCode).json(error);
        });
    }
}
