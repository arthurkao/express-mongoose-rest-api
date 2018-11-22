const _debug = require('debug');
const debug = _debug('controller:user');
const Boom = require('boom');
const Joi = require('joi');

const { UserService } = require('../service');

const isMongoID = function(id) {
  const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(id);
};

// TODO Move ra-simple-rest logic specific to ra-simple-rest helper
const filterObjByKeys = function(obj, keys){
  return Object.keys(obj).filter(key => keys.includes(key)).reduce((o, key) => ({...o, [key]: obj[key]}), {});
};

/**
 * Helper specifically to transform react-admin ra-simple-rest dataProvider query
 * see https://marmelab.com/react-admin/DataProviders.html and ra-simple-rest source
 * @param o
 * @returns {{}}
 */
const transformRAQueryOpt = function(o) {
  let obj = {};
  if(Object.keys(o).length === 0 && o.constructor === Object) return obj;
  Object.keys(o).map(key => {
    let value = o[key];
    try {
      value = JSON.parse(value);
    }catch(err){
      //error parsing o[key]. skip
      value = o[key];
    }
    obj[key] = value;
  });

  // To match ra-simple-rest dataProvider syntax
  const sort = obj.sort;
  if(!!sort && Array.isArray(sort) && sort.length === 2){
    //convert array to obj
    let [key, value] = sort;
    if(key === 'id') key = '_id';
    obj.sort = {[key]: value};
  }
  const range = obj.range;
  if(!!range && Array.isArray(range) && range.length === 2){
    //convert range = [0, 9] to skip = 0, limit = 10
    obj.skip = range[0];
    obj.limit = range[1] - range[0] + 1;
  }

  return obj;
};

//TODO debug when pagination with ra-simple-data
const buildRAContentRange = function(total, opt) {
  let contentRange = 'user ';
  const range = opt.range;
  if(!!range && Array.isArray(range) && range.length === 2) {
    let [start, end] = range;
    debug('start, end: ', start, end);
    contentRange += start + '-';
    contentRange += (end < total-1)? end: total-1; //in case end points over the end of docs
  }else {
    contentRange += (total === 0)? '0-0': '0-' + total-1;
  }
  contentRange += '/' + total;
  debug('contentRange: ', contentRange);
  return contentRange;
};

const UserJSONSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  email: Joi.string().email({ minDomainAtoms: 2 })
});

/**
 * UserController.js
 *
 * @description :: Controller for /user api that
 * 1. Validate input in param/req.body
 * 2. Invoke respective service to provide data
 * 3.1 Setup http status code and call res.send(...)
 * 3.2 throw Boom http error (will be handled in a custom Boom error handler middleware)
 */
module.exports = {
  /**
   * UserController.list()
   */
  list: (req, res) => {
    debug('list invoked');
    const allowed = ['filter', 'range', 'sort'];
    let opt = filterObjByKeys(req.query, allowed);
    opt = transformRAQueryOpt(opt);
    return UserService.getUsers(opt)
      .then((r) => {
        const users = r.data;
        res.set('Content-Range', buildRAContentRange(r.total, opt));
        return res.json(users);
      }, (err) => {
        throw Boom.internal('Error when finding users', err);
      });
  },

  /**
   * UserController.show()
   */
  show: (req, res) => {
    var id = req.params.id;
    debug('show invoked with id: ', id);
    if(!isMongoID(id)){
      return Promise.reject(Boom.badData('Invalid ID'));
    }
    return UserService.getUser(id)
      .then((user) => {
        if(user){
          return res.json(user);
        } else {
          throw Boom.notFound('User not found');
        }
      }, (err) => {
        throw Boom.internal('MongoError when find user', err);
      });
  },

  /**
   * UserController.create()
   */
  create: function (req, res) {
    const allowed = ['username', 'password', 'email'];
    const userJSON = filterObjByKeys(req.body, allowed);
    debug('create invoked with userJSON: ', userJSON);
    const result = Joi.validate(userJSON, UserJSONSchema);
    if(result.error){
      return Promise.reject(Boom.badData(result.error));
    }
    debug('attempt to save new User');
    return UserService.createUser(userJSON)
      .then((createdUser) => {
        return res.status(201).json(createdUser);
      }, (err) => {
        if(err.message === UserService.USER_EXIST){
          // user exists in database, likely caused by dup key(s)
          throw Boom.internal(err);
        } else {
          throw Boom.internal('Error creating user', err);
        }
      });
  },

  /**
   * UserController.update()
   */
  update: function (req, res) {
    const id = req.params.id;
    const allowed = ['username', 'password', 'email'];
    const userJSON = filterObjByKeys(req.body, allowed);
    debug('update invoked with id: ', id, 'userJSON: ', userJSON);
    if(!isMongoID(id)){
      return Promise.reject(Boom.badData('Invalid ID'));
    }
    const result = Joi.validate(userJSON, UserJSONSchema);
    if(result.error){
      return Promise.reject(Boom.badData(result.error));
    }
    return UserService.updateUser(id, userJSON).then((updatedUser) => {
      return res.json(updatedUser);
    }, (err) => {
      if(err.message === UserService.USER_NOT_EXIST){
        throw Boom.notFound('User not Found');
      }else{
        throw Boom.internal('Error updating user', err);
      }
    });
  },

  /**
   * UserController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;
    debug('remove invoked with id: ', id);
    if(!isMongoID(id)){
      return Promise.reject(Boom.badData('Invalid ID'));
    }
    return UserService.deleteUser(id).then((_) => {
      return res.status(204).json();
    }, (err) => {
      throw Boom.internal('Error deleting user', err);
    });
  }
};
