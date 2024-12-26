export function tryCatch<arg extends Array<unknown>, rtn>(fun: (...args: arg) => rtn, ...args: arg): { value: rtn, err: null, witherr: false } | { value: null, err: unknown, witherr: true } {
    try {
        return { value: fun(...args), err: null, witherr: false }
    } catch (error) {
        return { value: null, err: error, witherr: true }
    }
}