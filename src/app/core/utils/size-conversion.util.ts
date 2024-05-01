export function convertSizeToBytes(size: number, unit: 'KB' | 'MB' | 'GB'): number 
{
    const units = {
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
    };
  
    return size * units[unit];
}

export function convertTimeToSeconds(time: number, unit: 'seconds' | 'minutes' | 'hours' | 'days'): number {
    const units = {
        seconds : 1,
        minutes : 60,
        hours   : 60 * 60,
        days    : 24 * 60 * 60, 
    };

    return time * units[unit];
}