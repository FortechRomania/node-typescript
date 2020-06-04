import { injectable } from "tsyringe";
import { ErrorService } from "../error/ErrorService";
import { FirebaseService } from "../firebase/FirebaseService";
import { UtilsService } from "../utils/UtilsService";
import { User } from "./IUser";

@injectable()
export class UserDb {
    constructor(
        private firebaseService: FirebaseService,
        private errorService: ErrorService,
        private utilService: UtilsService
    ) {}

    public createUser(user: User): Promise<User> {
        return this.firebaseService.addRecord<User>("users", user).catch(() => {
            throw this.errorService.getErrorMessage(30);
        });
    }

    public async getUserByEmail(email: string): Promise<User> {
        const users = await this.firebaseService.getRecord("users", ["email", "==", email]);

        if (!users.length) {
            return null;
        }

        const { 0: user } = users;

        return this.utilService.getDataWithId(user);
    }

    public async getUsers(): Promise<User[]> {
        const users = await this.firebaseService.getAll("users");

        return users.map(this.utilService.getDataWithId);
    }
}
