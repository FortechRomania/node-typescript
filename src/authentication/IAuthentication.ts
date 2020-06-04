import { User } from "../user/IUser";

export interface AuthenticationCredentials {
    email: string;
    password: string;
}

export interface AuthenticationPayload {
    token: string;
    user: User;
}

export interface TokenPayload {
    id: string;
}
