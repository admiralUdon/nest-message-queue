interface AppCodeI {
    status      : number;
    code        : AppCodeE;
    description : string;
}

enum AppCodeE {
    OK                          = "00",
    INVALID_FORMAT              = "A1",
    RSV                         = "A2",
    INVALID_CONDITION           = "A3",
    BANK_CONNECTION_ERROR       = "B1",
    BANK_TIMEOUT                = "B2",
    BANK_INSUFFICIENT_FUND      = "B3",
    BANK_EXCEED_LIMIT           = "B4",
    BANK_TRANSACTION_DECLINE    = "B5",
    BANK_CARD_BLACKLISTED       = "B6",
    CARD_INVALID                = "C1",
    CARD_BLACKLISTED            = "C2",
    CARD_NOT_ALLOW              = "C3",
    CARD_REJECTED               = "C4",
    MULTIPLE_CARD_DETECTED      = "C5",
    CARD_EXPIRED                = "C6",
    TERMINAL_BUZY               = "E1",
    TERMINAL_NOT_ACTIVE         = "E2",
    TERMINAL_ACTIVE             = "E3",
    GENERAL_ERROR               = "EE",
    TERAS_INTERNAL              = "F0"
}

export class AppCode {

    static readonly OK: AppCodeI = { code: AppCodeE.OK, status: 200, description: "OK / Success" };
    static readonly INVALID_FORMAT: AppCodeI = { code: AppCodeE.INVALID_FORMAT, status: 400, description: "Invalid Data format /json" };
    static readonly RSV: AppCodeI = { code: AppCodeE.RSV, status: 400, description: "RSV" };
    static readonly INVALID_CONDITION: AppCodeI = { code: AppCodeE.INVALID_CONDITION, status: 400, description: "Invalid Condition / argument" };
    static readonly BANK_CONNECTION_ERROR: AppCodeI = { code: AppCodeE.BANK_CONNECTION_ERROR, status: 500, description: "Bank Connection Error" };
    static readonly BANK_TIMEOUT: AppCodeI = { code: AppCodeE.BANK_TIMEOUT, status: 500, description: "Bank Timeout" };
    static readonly BANK_INSUFFICIENT_FUND: AppCodeI = { code: AppCodeE.BANK_INSUFFICIENT_FUND, status: 400, description: "Bank – Account Insufficient Fund" };
    static readonly BANK_EXCEED_LIMIT: AppCodeI = { code: AppCodeE.BANK_EXCEED_LIMIT, status: 400, description: "Bank – Account Exceeded Limit" };
    static readonly BANK_TRANSACTION_DECLINE: AppCodeI = { code: AppCodeE.BANK_TRANSACTION_DECLINE, status: 400, description: "Bank – Transaction Decline by Acquirer / Bank" };
    static readonly BANK_CARD_BLACKLISTED: AppCodeI = { code: AppCodeE.BANK_CARD_BLACKLISTED, status: 400, description: "Bank – Card Blacklisted by Acquirer / Bank" };
    static readonly CARD_INVALID: AppCodeI = { code: AppCodeE.CARD_INVALID, status: 400, description: "Card Invalid" };
    static readonly CARD_BLACKLISTED: AppCodeI = { code: AppCodeE.CARD_BLACKLISTED, status: 400, description: "Card Blacklisted" };
    static readonly CARD_NOT_ALLOW: AppCodeI = { code: AppCodeE.CARD_NOT_ALLOW, status: 400, description: "Card Not Allow" };
    static readonly CARD_REJECTED: AppCodeI = { code: AppCodeE.CARD_REJECTED, status: 400, description: "Card Rejected" };
    static readonly MULTIPLE_CARD_DETECTED: AppCodeI = { code: AppCodeE.MULTIPLE_CARD_DETECTED, status: 400, description: "Multiple Card Detected" };
    static readonly CCARD_EXPIRED6: AppCodeI = { code: AppCodeE.CARD_EXPIRED, status: 400, description: "Card Expired" };
    static readonly TERMINAL_BUZY: AppCodeI = { code: AppCodeE.TERMINAL_BUZY, status: 400, description: "Terminal Busy" };
    static readonly TERMINAL_NOT_ACTIVE: AppCodeI = { code: AppCodeE.TERMINAL_NOT_ACTIVE, status: 400, description: "Terminal Not Active" };
    static readonly TERMINAL_ACTIVE: AppCodeI = { code: AppCodeE.TERMINAL_ACTIVE, status: 400, description: "Terminal Active" };
    static readonly GENERAL_ERROR: AppCodeI = { code: AppCodeE.GENERAL_ERROR, status: 400, description: "General Error / Unhandled Error" };
    static readonly TERAS_INTERNAL: AppCodeI = { code: AppCodeE.TERAS_INTERNAL, status: 400, description: "TERAS internal System Reserve" };

    getCode(code: AppCodeE): AppCodeI
    {
        return AppCode[code] ?? AppCode["GENERAL_ERROR"];
    }
}