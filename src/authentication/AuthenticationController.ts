import { injectable } from "tsyringe";
import { EncryptionService } from "../encryption/EncryptionService";
import { ErrorService } from "../error/ErrorService";
import { Path, RequestMethod, RestController } from "../router/ControllerDecorators";
import { UserSchema } from "../user/UserController";
import { UserDb } from "../user/UserDb";
import { UtilsService } from "../utils/UtilsService";
import { ValidateBody } from "../utils/ValidatorService";
import { AuthenticationSchema } from "./AuthenticationSchema";
import { AuthenticationService } from "./AuthenticationService";
import { AuthenticationCredentials, AuthenticationPayload, TokenPayload } from "./IAuthentication";

@injectable()
@RestController("/authentication")
export class AuthenticationController {
    constructor(
        private userDb: UserDb,
        private encryptionService: EncryptionService,
        private errorService: ErrorService,
        private authenticationService: AuthenticationService,
        private utilsService: UtilsService
    ) {}

    @Path("/")
    @RequestMethod("post")
    @ValidateBody(AuthenticationSchema)
    public async authenticate({ email, password }: AuthenticationCredentials): Promise<AuthenticationPayload> {
        const user = await this.userDb.getUserByEmail(email);
        if (!user) {
            throw this.errorService.getErrorMessage(20);
        }
        const passwordMatches = await this.encryptionService.verify(password, user.password);
        if (!passwordMatches) {
            throw this.errorService.getErrorMessage(20);
        }
        const tokenPayload: TokenPayload = {
            id: user.id
        };
        const token = this.authenticationService.signToken(tokenPayload);
        const cleanedUser = this.utilsService.cleanUnsafeValues(user, UserSchema);
        return {
            token,
            user: cleanedUser
        };
    }
}
