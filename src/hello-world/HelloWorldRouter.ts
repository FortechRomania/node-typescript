import { RouterBuilder } from "../router/RouterBuilder";
import { HTTPResponse } from "../router/HTTPResponse";
import { ErrorService } from "../error/ErrorService";
import { injectable } from "tsyringe";

@injectable()
export class HelloWorldRouter {
  constructor(private errorService: ErrorService){

  }
  printMessage =
    new RouterBuilder()
    .path("/")
    .get(() => {
      //The returned object is the body of the response
      return { message: "Hello world" }
    });
  printQueryParam =
    new RouterBuilder()
    .path("/print-query")
    //Filter queries by key
    .query("value", "count")
    // Query params are also given as arguments to the router function
    .get(({value, count}) => {
      return { message: `Hello ${value}. Count is ${count}` }
    });
  throwUnauthorized =
    new RouterBuilder()
    .path("/throw")
    .get(() => {
      throw this.errorService.getErrorMessage(20);
      return { success: true};
    });
  printPathParam =
    new RouterBuilder()
    //Path params are given as argument to the router function
    .path("/:value")
    .get(({value}) => {
      //Specify a custom body, headers and status for the response
      return new HTTPResponse({ body:{ message: `Hello ${value}` }, headers:{}, status: 203 })
    });
}
