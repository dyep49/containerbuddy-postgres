const os = require('os');
const consulOptions = {promisify: true}
const consul = require('consul')(consulOptions);

const primaryKey = 'postgres-master'
const sessionName = 'service/postgres/leader'

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

getSession(sessionName)
  .then(function(response) {
    console.log(response);
    if(!response || response.Session === undefined) {
      createSession(sessionName)
        .then(acquireLock)
        .then(function(response){
          response === true ? console.log('I AM THE MASTER!!!!!!!!!!!') : console.log('I AM THE SLAVE :(((((((');
        })
        .catch(console.log)
    } else {
      console.log('found the session, thanks');
    }
  })
  .catch(console.log) 
