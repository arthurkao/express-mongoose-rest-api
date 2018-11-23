module.exports = {
  /**
   * Transform react-admin ra-simple-rest dataProvider query
   * see https://marmelab.com/react-admin/DataProviders.html and ra-simple-rest source
   * @param query
   * @returns {{}}
   */
  transformQuery: (query) => {
    let obj = {};
    if(query.constructor != Object || Object.keys(query).length === 0) return obj;
    const sort = query.sort, range = query.range;
    if(!!sort && Array.isArray(sort) && sort.length === 2){
      //convert array to obj
      let [key, value] = sort;
      if(key === 'id') key = '_id';
      obj.sort = {[key]: value};
    }
    if(!!range && Array.isArray(range) && range.length === 2){
      //convert range = [0, 9] to skip = 0, limit = 10
      obj.skip = range[0];
      obj.limit = range[1] - range[0] + 1;
    }
    return obj;
  },
  calculateContentRange: (start, end, total) => {
    if(total === 0) return [0,0,0];
    if(end >= total) end = total-1;
    return [start, end, total];
  }
};