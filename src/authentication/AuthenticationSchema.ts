import { EMAIL_PATTERN, PASSWORD_PATTERN } from "../utils/ValidationConstants";
import { Schema } from "../utils/ValidatorService";

export const AuthenticationSchema: Schema = {
    email: { required: true, pattern: EMAIL_PATTERN },
    password: { required: true, minLength: 6, pattern: PASSWORD_PATTERN }
};
