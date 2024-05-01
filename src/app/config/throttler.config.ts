import { ThrottlerOptions } from "@nestjs/throttler";

export const throttlerConfig: ThrottlerOptions[] = [
    /** Temporary disable throttler */
    // {
    //     ttl: parseInt(process.env.DEFAULT_THROTTLE_TOTAL) || 60,
    //     limit: parseInt(process.env.DEFAULT_THROTTLE_LIMIT) || 10,
    //     ignoreUserAgents: [  // Optional: Specify User-Agents to ignore (e.g., bots)
    //         /Google Chrome/i,  // Ignore Google Chrome
    //         /Firefox/i,        // Ignore Firefox
    //         /Edg/i,           // Ignore Microsoft Edge
    //     ]
    // }
]