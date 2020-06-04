import { injectable } from "tsyringe";
import { User } from "../user/IUser";
import { UtilsService } from "../utils/UtilsService";
import { AuthenticationService } from "./AuthenticationService";
import { TokenPayload } from "./IAuthentication";

@injectable()
export class SecurityContext {
    private userId: string;
    private authenticatedUser: User;

    constructor(private authenticationService: AuthenticationService, private utilsService: UtilsService) {}

    public setUserId(id: string): SecurityContext {
        this.userId = id;
        return this;
    }

    public getUserId(): string {
        return this.userId;
    }

    public requireAuthenticatedUser(headers: { [key: string]: string }): SecurityContext {
        const token = this.utilsService.stripBearerToken(headers.authorization);
        const { id }: TokenPayload = this.authenticationService.verifyToken(token);
        return this.setUserId(id);
    }
}
