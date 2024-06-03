const fetch = require('node-fetch');

exports.handler = async (event) => {
  const token = event.authorizationToken;
  const isValid = await validateToken(token);

  if (isValid) {
    return generatePolicy('user', 'Allow', event.methodArn);
  } else {
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

async function validateToken(token) {
  const response = await fetch(`https://your-oauth2-provider.com/userinfo`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.ok;
}

function generatePolicy(principalId, effect, resource) {
  const authResponse = {};
  authResponse.principalId = principalId;

  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    };
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
}
