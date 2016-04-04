const os = require('os');
const consulOptions = {host: 'consul', promisify: true}
const consul = require('consul')(consulOptions);

const primaryKey = 'postgres-master';
const sessionName = 'service/postgres/leader';

const createSession = function createSession(name) {
  console.log('creating session');
  const sessionOptions = {name: "postgres"};
  return consul.session.create(sessionOptions);
}

const getSession = function getSession(key) {
  console.log('getting session');
  return consul.kv.get(key)
}

const acquireLock = function acquireLock(session) {
  console.log('aquiring lock');
  const hostName = os.hostname();
  const node = {hostName: hostName};
  return consul.kv.set(sessionName, JSON.stringify(node), {acquire: session.ID});
}

const handleSession = function  handleSession(response) {
  if(!response || response.Session === undefined) {
    console.log('NO SESSION FOUND');
    return createSession(sessionName)
          .then(checkPrimary);
  } else {
    console.log('SESSION FOUND');
    response.ID = response.Session;
    return checkPrimary(response);
  }
}

const checkPrimary = function checkPrimary(session) {
  return acquireLock(session)
        .then(isPrimary);
}

const isPrimary = function isPrimary(bool) {
  const nodeType = bool === true ? 'master' : 'slave';
  console.log('I am the', nodeType);
}

const discoverLeader = function discoverLeader(sessionName) {
  getSession(sessionName)
    .then(handleSession)
    .catch(function(e) {
      console.log(e);
      setTimeout(function() {
        discoverLeader(sessionName);
      }, 5000)
    }) 
}

discoverLeader(sessionName);
