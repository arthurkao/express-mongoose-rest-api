require('dotenv').config({ path: './test/.env' });
const chai = require('chai');

console.log('Mocha: Setup globals...');
console.log('NODE_ENV: ', process.env.NODE_ENV);
global.should = chai.should();
global.expect = chai.expect;
chai.use(require("chai-sorted"));