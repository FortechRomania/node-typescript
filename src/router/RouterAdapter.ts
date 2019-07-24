import { Express, Router, Request, Response, NextFunction } from "express";
import { container, injectable } from "tsyringe";
import url from "url"
import { IMiddleware } from "../middlewares/IMiddleware";

@injectable()
export class RouterAdapter {
    constructor() {}
    public buildRoute = ({
        basePath,
        Router,
        app,
        expressRouter
    }: {
        basePath: string,
        Router: any,
        app: Express,
        expressRouter: Router
    }): void => {
        const routerInstance = container.resolve(Router) as Router;
        for (const route in routerInstance) {
            const buildFunction = routerInstance[route].build;
            if (typeof buildFunction !== "function") {
                continue;
            }
            const routeProps = buildFunction();
            this.connectRouteToExpress({
                props: routeProps,
                expressRouter,
                basePath
            })
        }
        app.use("/", expressRouter);
    }
    private filterQuery = (query: any, keys: string[]) => keys.reduce((queryParams: Object, param: string) => ({
        ...queryParams,
        [param]: query[param]
    }), {});
    private resolveMiddlewares = (middlewares: IMiddleware[]) => {
      return middlewares.map((middleware: any) => (container.resolve(middleware) as IMiddleware).middleware);
    }
    private prepareExpressFunction = (props: any): any => (req: Request, res: Response, next: NextFunction): void => {
        (async () => {
            let controllerParams = {
                req,
                ...req.params,
                ...props
            };
            if (props.query && props.query.length) {
              const filteredQuery = this.filterQuery(req.query, props.query);
              controllerParams = {
                ...filteredQuery,
                ...controllerParams
              }
            }
            if (['put', 'patch', 'post'].includes(props.method)) {
                controllerParams.body = req.body || {};
            }
            try {
                const controllerResponse = await props.controller(controllerParams);
                if ((controllerResponse || {}).isHTTPResponse) {
                    const {body, headers, status} = controllerResponse;
                    return res.set(headers).status(status).json(body);
                }
                if (!controllerResponse) {
                    return res.status(204).send();
                }
                return res.status(200).json(controllerResponse);
            } catch (e) {
                next(e);
            }
        })();
    }
    private prepareExpressMiddlewares = (props: any) => {
      const resolvedMiddlewares = this.resolveMiddlewares(props.middlewares || []);
      return resolvedMiddlewares.map(
          (middleware: any) =>
          (req: Request, res: Response, next: NextFunction) =>{
            const query = props.query ? this.filterQuery(req.query, props.query) : {};
            return middleware({
              ...query,
              ...req.params,
                req,
                res,
                next
            })
          }
      )
    }

    private connectRouteToExpress = ({
        props,
        expressRouter,
        basePath
    }: {
        props: any,
        expressRouter: Router,
        basePath: string
    }) => {
        const controller = this.prepareExpressFunction(props);
        const middlewares = this.prepareExpressMiddlewares(props);
        const relativePath = url.resolve(basePath, props.path);

        expressRouter[props.method](relativePath, ...middlewares, controller);
        console.info(`Added route ${props.method.toUpperCase()} ${relativePath}`);
    }
}
