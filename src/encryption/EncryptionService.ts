import * as bcrypt from "bcrypt";
import { injectable } from "tsyringe";
import { ConfigService } from "../config/ConfigService";

@injectable()
export class EncryptionService {
    constructor(private configService: ConfigService) {}

    public hash(data: string): Promise<string> {
        const config = this.configService.getConfig();
        return bcrypt.hash(data, config.saltRounds);
    }

    public verify(data: string, hash: string): Promise<boolean> {
        return bcrypt.compare(data, hash);
    }
}
