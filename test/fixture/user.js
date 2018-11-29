const bcrypt = require('bcryptjs');
const faker = require('faker');
const password = bcrypt.hashSync('testpassword', 8);

const fakeOneUser = () => {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password
  }
};

let users = [];
const userFactory = (num) => {
  if(users.length != 0) return users;
  for(let i = 0; i < num; i++){
    users.push(fakeOneUser());
  }
  users[0]['username'] = 'testusername';
  return users;
};

module.exports = userFactory(25);