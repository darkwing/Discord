'use strict';

var github = require('octonode');

var githubClient = github.client();

/**
 * Format blob content received by GitHub for processing within Discord
 */
function prepareContent(content) {
    return new Buffer(content, 'base64').toString();
}

/**
 * For the purposes of testing, we may need to proxy the host
 */
function setGithubProxy(proxy) {
    githubClient.requestDefaults['proxy'] = proxy;
}

exports.githubClient = githubClient;
exports.setGithubProxy = setGithubProxy;
exports.prepareContent = prepareContent;
