'use strict'

const REGEX = {
  TRAILING_SLASH: /\/$/,
  FILE_EXTENSION: /(.+)\.[a-zA-Z0-9]{2,5}$/,
}

/**
 * Edge Lambda that serves as rewrite proxy / reverse-proxy that rewrites requests to support front-end app deployments
 * that were built/exported as static sites and hosted on S3 + CloudFront.
 *
 * The implementation supports NextJS apps exported using the 'Static HTML Export' feature with the config
 * option `trailingSlash: true` enabled for compatibility with hosting via AWS S3 + CloudFront.
 *
 * @see EdgeRewriteProxy aws-cdk construct
 */
exports.handler = (event, _context, callback) => {
  // extract request from CloudFront event
  const request = event.Records[0].cf.request
  const requestUri = request.uri || ''

  // example to access the array of request headers:
  // const headers = request.headers

  // example to access query parameters (note: requires import `const querystring = require('querystring')`):
  // const params = querystring.parse(request.querystring)

  // if the request uri has a trailing slash then replace that character with '/index.html'
  if (requestUri.match(REGEX.TRAILING_SLASH)) {
    request.uri = requestUri.replace(/\/$/, '/index.html')
  }

  // if the request uri is not for a file (due to lack of a file extension) then append '/index.html'
  if (!requestUri.match(REGEX.FILE_EXTENSION)) {
    request.uri = `${requestUri}/index.html`
  }

  if (requestUri !== request.uri) {
    console.log(`Request uri '${requestUri}' replaced with '${request.uri}'`)
  }

  return callback(null, request)
}

// end
