import { injectable } from "tsyringe";
import { Schema } from "./ValidatorService";

@injectable()
export class UtilsService {
    public cleanUnsafeValues<T>(object: T, schema: Schema): T {
        return Object.keys(object)
            .filter(objectKey => (schema[objectKey] ? !schema[objectKey].isUnsafe : true))
            .reduce(
                (filteredObject: T, filteredKey: string) => ({ ...filteredObject, [filteredKey]: object[filteredKey] }),
                {}
            ) as T;
    }

    public getDataWithId(querySnapshot: any) {
        return {
            id: querySnapshot.id,
            ...querySnapshot.data()
        };
    }

    public stripBearerToken(string: string = ""): string {
        return string.replace("Bearer ", "");
    }
}
