import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { ensureDir, existsSync } from "fs-extra";
import { resolve } from "path";

@Injectable()
export class CoreService implements OnApplicationBootstrap {

    private readonly logger = new Logger(CoreService.name);

    /**
     * Constructor
     */
    constructor(
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    onApplicationBootstrap() {
        this.ensureStorage();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private async ensureStorage() {
        const folderPath = resolve("./src/storage/logs");
        if (!existsSync(folderPath)) {
            await ensureDir(folderPath);
        }
    }
}