const { parseExpressQueryObj, filterObjByKeys, isMongoId, ra } = require('../../util');
const { transformQuery, calculateContentRange } = ra;
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
  describe('ra-data-simple-rest helpers', function() {
    describe('#transformQuery()', function() {
      it('should transform sort dialect to mongo query style', function() {
        const query1 = { sort: ['id', 'ASC'] };
        const query2 = { sort: ['email', 'ASC']};
        const res1 = { sort: { '_id': 'ASC' } };  // to match mongoose _id
        const res2 = { sort: { 'email': 'ASC' } };
        expect(transformQuery(query1)).to.deep.equal(res1);
        expect(transformQuery(query2)).to.deep.equal(res2);
      });
      it('should transform range dialect to mongo query style', function() {
        const query = { range: ['1000', '1009'] };
        const res = { skip: 1000, limit: 10 };
        expect(transformQuery(query)).to.deep.equal(res);
      });
      it('should handle ill-formed range dialect', function() {
        const query = { range: ['9', '0'] };
        const res = { skip: 9, limit: 10 };
        expect(transformQuery(query)).to.deep.equal(res);
      });
    });
    describe('#calculateContentRange()', function() {
      /**
       * pointers:
       * ----start-----end-----total
       * normal case, do nothing
       */
      it('should return obj containing Content-Range information', function() {
        const res = { start: 0, end: 9, total: 100 };
        expect(calculateContentRange(res.start, res.end, res.total)).to.deep.equal(res);
      });
      it('should handle total === 0 case', function() {
        const start = 10000, end = 10009, total = 0;
        expect(calculateContentRange(start, end, total)).to.deep.equal({
          start: 0,
          end: 0,
          total: 0
        });
      });
      /**
       * pointers:
       * ----start-----total----end
       * changes to
       * ----start-----end/total
       */
      it('should handle end points over the end of data set case', function() {
        const start = 9996, end = 10000, total = 10000;
        expect(calculateContentRange(start, end, total)).to.deep.equal({
          start,
          end: total - 1,
          total
        });
      });
      /**
       * pointers:
       * ----total----start----end
       * do nothing as empty data array should be returned
       */
      it('should do nothing if both start/end point over the end of data set', function() {
        const start = 51, end = 60, total = 40;
        expect(calculateContentRange(start, end, total)).to.deep.equal({
          start,
          end,
          total
        });
      });
    });
  });
});