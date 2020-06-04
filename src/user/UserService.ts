import { injectable } from "tsyringe";
import { EncryptionService } from "../encryption/EncryptionService";
import { ErrorService } from "../error/ErrorService";
import { User } from "./IUser";
import { UserDb } from "./UserDb";

@injectable()
export class UserService {
    constructor(
        private userDb: UserDb,
        private encryptionService: EncryptionService,
        private errorService: ErrorService
    ) {}

    public async createUser(user: User): Promise<User> {
        const alreadyExistingUser = await this.userDb.getUserByEmail(user.email);

        if (alreadyExistingUser) {
            throw this.errorService
                .withCustomErrorMessage("A user with this email already exists in our database")
                .getErrorMessage(40);
        }

        const hashedPassword = await this.encryptionService.hash(user.password);

        const formattedUser: User = {
            ...user,
            password: hashedPassword
        };
        return this.userDb.createUser(formattedUser);
    }

    public async getAllUsers(): Promise<User[]> {
        return this.userDb.getUsers();
    }
}
