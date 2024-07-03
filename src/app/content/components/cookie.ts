function tenYearsFromNow() {
    const d = new Date();

    d.setFullYear(d.getFullYear() + 10);
    return d;
}

export default {
    get hash() {
        if (typeof document === 'undefined') {
            return {};
        }
        return decodeURIComponent(document.cookie)
            .split('; ')
            .reduce((a: {[key: string]: string}, b) => {
                const [key, val] = b.split('=');

                a[key] = val;
                return a;
            }, {});
    },
    setKey(key: string, value= 'true', expires= tenYearsFromNow()) {
        const expireString = expires.toUTCString();

        if (typeof document === 'undefined') {
            return;
        }
        document.cookie = `${key}=${value};path=/;expires=${expireString}`;
    },
    deleteKey(key: string) {
        if (typeof document === 'undefined') {
            return;
        }
        document.cookie = `${key}=true;path=/;expires=Thu, 1 Jan 1970 03:14:07 GMT`;
    },
};
