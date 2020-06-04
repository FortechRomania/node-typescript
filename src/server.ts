import { app } from "firebase-admin";
import "reflect-metadata";
import { injectable } from "tsyringe";
import { AuthenticationController } from "./authentication/AuthenticationController";
import { FirebaseService } from "./firebase/FirebaseService";
import { ExpressAdapter } from "./router/ExpressAdapter";
import { Server } from "./server/Server";
import { UserController } from "./user/UserController";

@Server({
    adapter: ExpressAdapter,
    controllers: [UserController, AuthenticationController]
})
@injectable()
export class AppServer {
    constructor(protected firebaseService: FirebaseService) {}
}
