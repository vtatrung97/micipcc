export function convertListToString(arr: any){
    if(Array.isArray(arr) && arr && arr.length > 0){
        return [...arr.filter((item: any) => item || item == 0)].toString()
    }
    return ""
}

export function convertListToStringAndSpace(arr: any){
    if(Array.isArray(arr) && arr && arr.length > 0){
        return [...arr.filter((item: any) => item)].join(', ')
    }
    return ""
}
