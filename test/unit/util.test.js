const { parseExpressQueryObj, filterObjByKeys, isMongoId } = require('../../util');
describe('util functions', function() {
  describe('#parseExpressQueryObj()', function() {
    it('should parse express query object field values', function() {
      const query = {
        range: '[0,9]',
        sort: '["id", "DESC"]',
        filter: '{"q": "test"}'
      };
      const result = parseExpressQueryObj(query);
      result.range.should.deep.equal([ 0, 9 ]);
      result.sort.should.deep.equal(['id', 'DESC']);
      result.filter.should.deep.equal({ q: 'test' });
    });
  });
  describe('#filterObjByKeys()', function() {
    let obj;
    beforeEach(function() {
      obj = {
        'a': 'a',
        'b': 'b',
        'c': 'c'
      };
    });
    it('should filter out keys not in allowed keys array', function() {
      let allowed = ['b'];
      const result = filterObjByKeys(obj, allowed);
      expect(result['a']).to.be.undefined;
      expect(result['b']).to.equal('b');
      expect(result['c']).to.be.undefined;
    });
    it('should return a copy of obj if allowed keys are missing', function() {
      const result = filterObjByKeys(obj, undefined);
      result.should.deep.equal(obj);
    });
  });
  describe('#isMongoId()', function() {
    it('should be able to tell valid mongo id from invalid ones', function() {
      const validId = '5bf83941843934cfd4d39b9b';
      const invalidId = 'somerandomstring';
      expect(isMongoId(validId)).to.be.true;
      expect(isMongoId(invalidId)).to.be.false;
    });
  });
});
