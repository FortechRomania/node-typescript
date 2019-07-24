
export class RouterBuilder {
    state: any;
    get:any;
    post: any;
    put: any;
    patch: any;
    delete: any;
    constructor(state: any = {}) {
        this.state = state;
        const methods = ['get', 'post', 'put', 'patch', 'delete'];
        for(const method of methods){
            this[method] = (controller?: (any)) => {
                if(controller){
                    return new RouterBuilder({...this.state, method, controller});
                }
                else{
                    return new RouterBuilder({...this.state});
                }
            }
        }
    }
    path = (path: String) => {
        return new RouterBuilder({...this.state, path})
    }
    build = () => {
        return this.state;
    }
    query = (...keys: string[]) => {
        return new RouterBuilder({ ...this.state, query : [...(this.state.query || []), ...keys] });
    };
    middlewares = (...middlewares: any[]) => {
      return new RouterBuilder({...this.state, middlewares});
    }
}
