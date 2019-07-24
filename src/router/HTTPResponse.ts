
export interface IHTTPResponse{
  body?: any;
  headers?: { [key: string]: string };
  status?: number;
}

export class HTTPResponse implements IHTTPResponse{
  public isHTTPResponse: boolean = true;
  headers = {};
  
  constructor(properties: IHTTPResponse){
    Object.assign(this, properties)
  }
}
