import * as admin from "firebase-admin";
import { singleton } from "tsyringe";
import { ConfigService } from "../config/ConfigService";

import * as serviceAccount from "./key.json";

import { FieldPath, WhereFilterOp } from "@google-cloud/firestore";

@singleton()
export class FirebaseService {
    constructor(private configService: ConfigService) {
        const config = this.configService.getConfig();
        if (config.environment === "PRODUCTION") {
            console.log("Using firebase production environment");
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        } else {
            console.log("Using firebase local environment");
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
            });
        }
    }

    public getFirestoreInstance(): FirebaseFirestore.Firestore {
        return admin.firestore();
    }

    public async addRecord<Type>(collection: string, object: Type): Promise<Type> {
        const createdObjectRef = await this.getFirestoreInstance()
            .collection(collection)
            .add(object);
        return {
            id: createdObjectRef.id,
            ...object
        };
    }

    public async getRecord(collection: string, operators: [string | FieldPath, WhereFilterOp, any]): Promise<any> {
        const snapshot = await this.getFirestoreInstance()
            .collection(collection)
            .where(...operators)
            .get();
        if (snapshot.empty) {
            return [];
        }
        const results = [];
        snapshot.forEach(singleResult => results.push(singleResult));
        return results;
    }

    public async getAll(collection: string): Promise<any> {
        const snapshot = await this.getFirestoreInstance()
            .collection(collection)
            .get();
        if (snapshot.empty) {
            return [];
        }
        const results = [];
        snapshot.forEach(singleResult => results.push(singleResult));
        return results;
    }
}
