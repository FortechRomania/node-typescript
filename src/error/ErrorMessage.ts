import { IErrorMessage } from "./IErrorMessage";

export class ErrorMessage implements IErrorMessage{
  constructor(initialData: IErrorMessage){
    Object.assign(this, initialData);
  }
}
