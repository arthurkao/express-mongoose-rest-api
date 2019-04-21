module.exports = {
  parseExpressQueryObj : (obj) => {
    let result = {};
    if(obj.constructor != Object || Object.keys(obj).length === 0) return result;
    Object.keys(obj).map(key => {
      let value = obj[key];
      try {
        value = JSON.parse(value);
      }catch(err){
        //error parsing o[key]. skip
        value = obj[key];
      }
      result[key] = value;
    });
    return result;
  },
  filterObjByKeys: (obj, keys = []) => {
    if(keys.length === 0){
      keys = Object.keys(obj);
    }
    return Object.keys(obj).filter(key => keys.includes(key)).reduce((o, key) => ({...o, [key]: obj[key]}), {});
  },
  isMongoId: (id) => {
    const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    return !!id && checkForHexRegExp.test(id);
  }
};

