import { injectable } from "tsyringe";
import { ErrorMessage } from "./ErrorMessage";

@injectable()
export class ErrorService {
    private customDetailedMessage: string;

    public withCustomErrorMessage(errorMessage: string): ErrorService {
        this.customDetailedMessage = errorMessage;
        return this;
    }

    public getErrorMessage(code: number = 0): ErrorMessage {
        const allMessages = this.getMessage();
        const message = allMessages.find(m => m.code === code) || allMessages[0];
        if (this.customDetailedMessage) {
            message.detailedMessage = this.customDetailedMessage;
        }
        return new ErrorMessage(message);
    }

    private getMessage(): any[] {
        return [
            {
                statusCode: 500,
                code: 0,
                message: "Server Error",
                detailedMessage: "Something's broken on the server side"
            },
            {
                statusCode: 404,
                code: 10,
                message: "The requested resource was not found",
                detailedMessage:
                    "The requested resource was not found in the database. Please check the request parameters"
            },
            {
                statusCode: 401,
                code: 20,
                message: "Not enough permissions",
                detailedMessage: "You don't have enough permissions to access the requested resource"
            },
            {
                statusCode: 403,
                code: 30,
                message: "Couldn't save data",
                detailedMessage: "You don't ahve enough permissions to access the requested resource"
            },
            {
                statusCode: 422,
                code: 40,
                message: "Invalid request parameters"
            }
        ];
    }
}
