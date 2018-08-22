export function map( x,  in_min,  in_max,  out_min,  out_max){
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
export function clamp(a,b,c) {
    return Math.max(b,Math.min(c,a));
}
export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
export function sortArrayByObjectKey(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}