/**
 * @module constants/badConnection.exit.js
 * @constant
 */
module.exports = {
  friendlyName: 'Bad connection',
  description: 'The provided connection is not valid or no longer active.  Are you sure it was obtained by calling this adapter\'s `getConnection()` method?',
  extendedDescription: 'Usually, this means the connection to the database was lost due to a logic error or timing issue in userland code.  In production, this can mean that the database became overwhelemed or was shut off while some business logic was in progress.',
  outputVariableName: 'report',
  outputDescription: 'The `error` property is a JavaScript Error instance containing the raw error from the database.  The `meta` property is reserved for custom adapter-specific extensions.',
  example: {
    error: '===',
    meta: '==='
  }
};
