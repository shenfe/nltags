/**
 * Set browser cookies in the context object
 */
const setCookie = (ctx, obj) => {
    for (let p in obj) {
        if (!obj.hasOwnProperty(p)) continue;
        ctx.cookies.set(p, obj[p], {
            httpOnly: false
        });
    }
};

/**
 * Get browser cookies in the context object
 */
const getCookie = (ctx, arr) => {
    if (typeof arr === 'string') return ctx.cookies.get(obj);
    if (!Array.isArray(arr)) return null;
    let re = {};
    for (let p of arr) {
        re[p] = ctx.cookies.get(p);
    }
    return re;
};

module.exports = {
    setCookie,
    getCookie
};
