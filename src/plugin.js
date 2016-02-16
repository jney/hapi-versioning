'use strict';

exports.register = function(plugin, options, next){
  //Check if header contains version
  var DEFAULT_HEADER_KEY = 'version';
  var DEFAULT_PATTERN = /^(v[1-9])$/;
  var aliases = options.aliases || [];
  var versionHeader = (options.header || DEFAULT_HEADER_KEY).toLowerCase();
  var pattern = options.pattern || DEFAULT_PATTERN;

  plugin.ext('onRequest', function(request, reply) {
    var urlPath = request.url.pathname.split('/');
    if (urlPath[0] === '') urlPath.shift();
    var version = getVersion(request.headers[versionHeader], pattern);

    if (version && !pattern.test(urlPath[0])){
      urlPath.unshift('', version);
      request.setUrl(urlPath.join('/') + (request.url.search || ''));
    }

    reply.continue();
  });
  next();

  /**
   * @function getAlias
   * returns alias reference, if one, or returns self
   */
  function getAlias (key) {
    // return key if key is a reference
    if (aliases[key]) return key;
    var res = key;
    Object.keys(aliases).some(function (e) {
      if (aliases[e].indexOf(key) > -1) {
        res = e;
        return true;
      }
    })
    return res;
  }

  /**
   * @function getVersion
   * returns matching version in the header or default version, if defined
   */
  function getVersion(header, pattern) {
    var match = header.match(pattern);
    return getAlias(match ? match[1] : options.defaultVersion);
  }
};
