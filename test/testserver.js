var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../mytestapp/app');
var should = chai.should();

chai.use(chaiHttp);


describe('users', function() {
  it('should list ALL users on /users GET', function(done) {
  chai.request(server)
    .get('/users')
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.html;
      //res.body.should.be.a('array');
      done();
    });
});


it('should add a SINGLE blob on /users POST');

  it('should add a SINGLE user on /users POST');
  it('should update a SINGLE user on /user/<id> PUT');
  it('should delete a SINGLE user on /user/<id> DELETE');
});
