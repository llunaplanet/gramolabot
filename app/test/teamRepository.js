process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;

const TeamRepository = require('../src/lib/teamRepository');
const SlackTeam = require('../src/lib/team')
const aws = require('aws-sdk');

// docker run -p 8000:8000 -d --name dynamodb peopleperhour/dynamodb

before(function(done) {

    aws.config.update({
        region: "any_region",
        endpoint: "http://localhost:8000"
    });

    teamRepository = new TeamRepository(aws, 'tablePrefix');

    teamRepository.deleteTable(function(err) {
        if(err) console.log(typeof(err));
        done();
    });

    slackTeam = new SlackTeam("any_team_id", {});
    slackTeam.spotify = {
        user: "any_spotify_user",
        access_token: "any_access_token",
        refresh_token: "any_refresh_token",
        expires_in: "any_expiration"
    };
})

describe('TeamRepository', function(){

  it('should create a new table', function(done) {
      teamRepository.createTable(function(err) {
          expect(err).to.be.null;
          done();
      });
  });

  it('should add a new SlackTeam to the repository', function(done) {

      teamRepository.addOrReplace(slackTeam, function(err) {
          expect(err).to.be.null;
          done();
      })
  });

  it('should find a the SlackTeam with [any_team_id] hash Key', function(done) {

      teamRepository.findBy("any_team_id", function(err, obj) {
          expect(err).to.be.null;
          expect(obj).instanceof(SlackTeam);
          expect(obj).to.have.property('slack_team_id', 'any_team_id');
          expect(obj.spotify).to.deep.equal({
              user: "any_spotify_user",
              access_token: "any_access_token",
              refresh_token: "any_refresh_token",
              expires_in: "any_expiration"
          });
          done();
      })
  });

  it('should update the SlackTeam with [any_team_id] hash Key', function(done) {

      slackTeam.spotify.expires_in = null;

      teamRepository.addOrReplace(slackTeam, function(err, obj) {
          expect(err).to.be.null;
          done();
      });
  });

  it('should find a the updated SlackTeam with [any_team_id] hash Key', function(done) {

      teamRepository.findBy("any_team_id", function(err, obj) {
          expect(err).to.be.null;
          expect(obj).instanceof(SlackTeam);
          expect(obj.spotify).to.deep.equal({
              user: "any_spotify_user",
              access_token: "any_access_token",
              refresh_token: "any_refresh_token",
              expires_in: null
          });
          done();
      })
  });

  it('should fail to find a SlackTeam [fixtureKeyOne] hash key', function(done) {

      teamRepository.findBy("fixtureKeyOne", function(err, doc) {
          expect(err).to.be.null;
          expect(doc).to.be.null;
          done();
      });
  });

  it('should delete the table', function(done) {
      teamRepository.deleteTable(function(err) {
          expect(err).to.be.null;
          done();
      });
  });

});
