import { HelloWorldRouter } from "./hello-world/HelloWorldRouter";

interface Route{
  basePath: string,
  router: any
};

export const Routes: Route[] = [
  { basePath: "/", router: HelloWorldRouter }
]
