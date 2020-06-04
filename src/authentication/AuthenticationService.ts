import { JWT } from "jose";
import { injectable } from "tsyringe";
import { ConfigService } from "../config/ConfigService";
import { ErrorService } from "../error/ErrorService";
import { TokenPayload } from "./IAuthentication";

@injectable()
export class AuthenticationService {
    constructor(private configService: ConfigService, private errorService: ErrorService) {}

    public signToken(payload: TokenPayload): string {
        const { privateKey } = this.configService.getConfig();
        return JWT.sign(payload, privateKey, {
            header: {
                typ: "JWT"
            }
        });
    }

    public verifyToken(token: string): TokenPayload {
        try {
            const { privateKey } = this.configService.getConfig();
            return JWT.verify(token, privateKey) as TokenPayload;
        } catch {
            throw this.errorService.getErrorMessage(20);
        }
    }
}
