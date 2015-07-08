var fs = require('fs');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock = require('nock');
var request = require('request');

var hook = require('../hook');
var utils = require('../utils');

var assert = chai.assert;
var should = chai.should();
chai.use(chaiAsPromised);

var appHost = 'http://localhost:5000/';
var githubProxyHost = 'http://host:8000/';
var urlPatterns = {
    repo: 'repos/{repo}',
    pr: 'repos/{repo}/pulls/{number}',
    commits: 'repos/{repo}/pulls/{number}/commits',
    commit: 'repos/{repo}/commits/{sha}',
    contents: 'repos/{repo}/contents/{path}?ref={sha}'
};

var githubClient = utils.githubClient;
utils.setGithubProxy('http://host:8000/');

function substitute(str, data) {
    return str.replace((/\\?\{([^{}]+)\}/g), function(match, name){
        if (match.charAt(0) == '\\') return match.slice(1);
        return (data[name] != null) ? data[name] : '';
    });
}

function getFileContents(fixture) {
    return JSON.parse(fs.readFileSync('fixtures/' + fixture + '.json'));
}


/*
    How to scrub the payloads taken from test repo/user:

    -  Change username to `x_user`
    -  Change respository name to `x_repo`
    -  Change sender.id to `8675309`
    -  Change user's real name to `Test User`
    -  Change user's real email to `testuser@somewhere.com`
*/

describe('Hook tests', function() {

    describe('Homepage', function() {
        it('Should confirm homepage is working properly', function(done) {
            request(appHost, function (error, response, body) {
                assert.ok(!error && response.statusCode === 200);
                done();
            });
        });
    });


    describe('Pull Requests', function() {
        it('One PR with one commit', function(done) {

            var githubPayload = getFileContents('test1-payload');
            var githubHeaders = getFileContents('test1-headers');

            var commitsPayload = getFileContents('test1-commits');
            var commit1Payload = getFileContents('test1-commit1');
            var commit1Contents = getFileContents('test1-commit1-contents');

            var repoFullName = githubPayload.pull_request.base.repo.full_name;

            // Create interceptors for GitHub requests
            nock(githubProxyHost)
                .get(substitute(urlPatterns.commits, {
                    repo: repoFullName,
                    number: githubPayload.pull_request.number
                }))
                .reply(200, commitsPayload);

            nock(githubProxyHost)
                .get(substitute(urlPatterns.commit, {
                    repo: repoFullName,
                    sha: commit1Payload.sha
                }))
                .reply(200, commit1Payload);

            nock(githubProxyHost)
                .get(substitute(urlPatterns.contents, {
                    repo: repoFullName,
                    path: commit1Payload.files[0].filename,
                    sha: commit1Payload.sha
                }))
                .reply(200, commit1Payload);

            var requestOptions = {
                url: appHost + 'hook',
                headers: githubHeaders,
                form: githubPayload
            };

            // Simulate the ping from GitHub
            request.post(requestOptions, function(error, response, body) {
                    assert.ok(!error && response.statusCode === 200 && body === 'OK');

                    // Need to add some sort of additional call


                    done();
            });

        });
    });

});
