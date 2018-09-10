const environments = {};
environments.staging = {
    'envName' : 'staging',
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'hashingSecret' : 'thisIsASecret'
};

environments.production = {
    'envName' : 'production',
    'httpPort' : 80,
    'httpsPort' : 443,
    'hashingSecret' : 'thisIsAlsoASecret'
};

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;