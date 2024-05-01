import { createHash, createHmac } from 'crypto';

export function generateMD5(input) {
    const hash = createHash('md5');
    hash.update(input);
    return hash.digest('hex');
}

export function generateHmac(data, key, algorithm: 'sha256' | 'sha512' | 'md5') {
    const hmac = createHmac(algorithm, key);
    hmac.update(data);
    return hmac.digest('hex');
}