'use strict'

const REGEX = {
  TRAILING_SLASH: /\/$/,
  FILE_EXTENSION: /(.+)\.[a-zA-Z0-9]{2,5}$/,
}

/**
 * Edge Lambda that serves as rewrite proxy / reverse-proxy that rewrites requests to support front-end app deployments
 * built/exported as static sites and hosted with S3 + CloudFront.
 *
 * It implements the "classic" web server (Apache2/nginx/etc) behavior of default directory indexes by appending `/index.html`
 * to requests for apparent directories in both the with-and-without trailing slash cases.
 *
 * The implementation supports NextJS apps exported via the 'Static HTML Export' feature with the config
 * option `trailingSlash` set to `true`.
 *
 * Important: CloudFront distributions should **not** specify a `defaultRootObject` when configured to use this function.
 *
 * @see EdgeRewriteProxy project aws-cdk construct
 * @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html}
 * @see {@link https://aws.amazon.com/blogs/compute/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-lambdaedge/}
 */
exports.handler = (event, _context, callback) => {
  // extract request from CloudFront event
  const request = event.Records[0].cf.request
  const requestUri = request.uri || ''

  // example to access the array of request headers:
  // const headers = request.headers

  // example to access query parameters (note: requires import `const querystring = require('querystring')`):
  // const params = querystring.parse(request.querystring)

  // if the request uri has a trailing slash then replace it with '/index.html'
  if (requestUri.match(REGEX.TRAILING_SLASH)) {
    request.uri = requestUri.replace(REGEX.TRAILING_SLASH, '/index.html')

    console.log(`Request uri '${requestUri}' replaced with '${request.uri}'`)
    return callback(null, request)
  }

  // if the request uri is not for a file (no file extension) then append '/index.html'
  if (!requestUri.match(REGEX.FILE_EXTENSION)) {
    request.uri = `${requestUri}/index.html`

    console.log(`Request uri '${requestUri}' replaced with '${request.uri}'`)
    return callback(null, request)
  }

  return callback(null, request)
}

// end
