import { container, injectable } from "tsyringe";
import { ErrorService } from "../error/ErrorService";

// TO-DO extract in a new file
export const ValidateBody = (schema: Schema, validationType?: ValidationTypes): MethodDecorator => (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
): void => {
    const originalMethod = descriptor.value;
    descriptor.value = function(args: any) {
        const validatorService = container.resolve(ValidatorService);
        const { body } = args;
        const validatedBody = validatorService.validate(body, schema, validationType);
        const newArgs = {
            ...args,
            body: validatedBody
        };
        return originalMethod.call(this, newArgs);
    };
};

// TO-DO extract these two in a new file

/**
 * @typedef {interface} ValidationMethod
 * @property {boolean} ValidationMethod.required - The value is required,
 * @property {number} ValidationMethod.minLength - The value should have a minumum length of {value},
 * @property {number} ValidationMethod.maxLength - The value should have a maximum length of {value},
 * @property {string | RegExp} ValidationMethod.pattern - The value should match the following pattern,
 * @property {boolean} ValidationMethod.isUnsafe - Mark property as unsafe. All unsafe values are removed before the object is returned to the client
 */
interface ValidationMethod {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string | RegExp;
    isUnsafe?: boolean;
}

export interface Schema {
    [key: string]: ValidationMethod;
}

export enum ValidationTypes {
    /** Throws an error when a property is not found in the schema */
    STRICT,
    /** Cleans the object removing all elements that are not found in the schema */
    SAFE
}

@injectable()
export class ValidatorService {
    constructor(private errorService: ErrorService) {}

    public validate<T>(object: T, schema: Schema, validationType?: ValidationTypes): T {
        const safeObject = {} as T;
        Object.keys(schema).forEach(schemaKey => {
            const validatorOptions = schema[schemaKey];
            const objectValue = object[schemaKey];
            safeObject[schemaKey] = objectValue;
            if (
                validatorOptions.required &&
                (objectValue === null || objectValue === undefined) &&
                validationType !== ValidationTypes.SAFE
            ) {
                throw this.errorService
                    .withCustomErrorMessage(`The parameter "${schemaKey}" is required but instead got "${objectValue}"`)
                    .getErrorMessage(40);
            } else if (!validatorOptions.required && (objectValue === null || objectValue === undefined)) {
                return;
            }
            if (validatorOptions.minLength && objectValue.length < validatorOptions.minLength) {
                throw this.errorService
                    .withCustomErrorMessage(
                        `Expected parameter "${schemaKey}" to have a minimum length of "${validatorOptions.minLength}" but instead it has "${objectValue.length}"`
                    )
                    .getErrorMessage(40);
            }
            if (validatorOptions.maxLength && objectValue.length > validatorOptions.maxLength) {
                throw this.errorService
                    .withCustomErrorMessage(
                        `Expected parameter "${schemaKey}" to have a maximum length of "${validatorOptions.maxLength}" but instead it has "${objectValue.length}"`
                    )
                    .getErrorMessage(40);
            }
            if (validatorOptions.pattern) {
                const patternValidator = new RegExp(validatorOptions.pattern);
                if (!patternValidator.test(objectValue)) {
                    throw this.errorService
                        .withCustomErrorMessage(
                            `Expected parameter "${schemaKey}" to match the following pattern "${validatorOptions.pattern}"`
                        )
                        .getErrorMessage(40);
                }
            }
        });
        if (validationType === ValidationTypes.STRICT) {
            Object.keys(object).forEach(objectKey => {
                if (!schema[objectKey]) {
                    throw this.errorService
                        .withCustomErrorMessage(`Expected object not to have the "${objectKey}" property`)
                        .getErrorMessage(40);
                }
            });
        }

        return validationType === ValidationTypes.SAFE ? safeObject : object;
    }
}
