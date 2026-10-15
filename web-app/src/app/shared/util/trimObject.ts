export function trimValueObject(obj: any): any {
  const validObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== "" && typeof value === "string") {
        console.log(value, typeof value);

        validObj[key] = value?.trim();
      }
    }
  }
  return validObj;
}
