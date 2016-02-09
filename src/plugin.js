'use strict';

exports.register = function(plugin, options, next){
  //Check if header contains version
  var DEFAULT_HEADER_KEY = 'version';
  var DEFAULT_PATTERN = /^(v[1-9])$/;
  var versionHeader = (options.header || DEFAULT_HEADER_KEY).toLowerCase();
  var pattern = options.pattern || DEFAULT_PATTERN;

  plugin.ext('onRequest', function(request, reply) {
    var urlPath = request.url.pathname.split('/');
    if (urlPath[0] === '') urlPath.shift();
    const version = getVersion(request.headers[versionHeader], pattern);

    if (version && !pattern.test(urlPath[0])){
      urlPath.unshift('', version);
      request.setUrl(urlPath.join('/') + (request.url.search || ''));
    }

    reply.continue();
  });
  next();

  /**
   * @function getVersion
   * returns matching version in the header or default version, if defined
   */
  function getVersion(header, pattern) {
    const match = header.match(pattern);
    if (match) return match[1];
    return options.defaultVersion;
  }
};
