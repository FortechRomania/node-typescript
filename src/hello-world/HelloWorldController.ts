import { injectable } from "tsyringe";
import {
  Path,
  RequestMethod,
  RestController
} from "../router/ControllerDecorators";
import { ErrorService } from "../error/ErrorService";

@injectable()
@RestController("/")
export class HelloWorldController {

  constructor(private errorService: ErrorService){}

  @Path("/")
  @RequestMethod("get")
  public printMessage() {
    return { message: "Hello World" };
  }

  @Path("/error/:number")
  @RequestMethod("all")
  public throwError({ number }) {
    return { number };
    // throw this.errorService.getErrorMessage(10)
  }

}
