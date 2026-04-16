'use strict';

function log(level, service, event, payload = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    event,
    ...payload
  };
  console.log(JSON.stringify(entry));
}

module.exports = {
  info: (service, event, payload) => log('info', service, event, payload),
  debug: (service, event, payload) => log('debug', service, event, payload),
  error: (service, event, payload) => log('error', service, event, payload)
};
