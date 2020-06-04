import { injectable } from "tsyringe";
import { AuthGuard } from "../authentication/AuthGuardDecorator";
import { Path, RequestMethod, RestController } from "../router/ControllerDecorators";
import { UtilsService } from "../utils/UtilsService";
import { Schema, ValidateBody, ValidationTypes } from "../utils/ValidatorService";
import { User } from "./IUser";
import { UserService } from "./UserService";

export const UserSchema: Schema = {
    firstName: { required: true, minLength: 5 },
    lastName: { required: true },
    email: { required: true },
    password: { required: true, isUnsafe: true }
};

@injectable()
@RestController("/user")
export class UserController {
    constructor(private userService: UserService, private utilsService: UtilsService) {}

    @Path("/")
    @RequestMethod("post")
    @ValidateBody(UserSchema, ValidationTypes.SAFE)
    public async createUser({ body }: { body: User }): Promise<User> {
        const user = await this.userService.createUser(body);
        return this.utilsService.cleanUnsafeValues(user, UserSchema);
    }

    @Path("/")
    @RequestMethod("get")
    @AuthGuard()
    public async gettAllUsers() {
        const users = await this.userService.getAllUsers();
        return users.map(user => this.utilsService.cleanUnsafeValues(user, UserSchema));
    }
}
