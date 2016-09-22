module.exports = require('machine').build({


  friendlyName: 'Validate connection',


  description: 'Check if this looks like a valid PostgreSQL connection instance.',


  cacheable: true,


  sync: true,


  inputs: {

    connection: {
      friendlyName: 'Connection',
      description: 'An active database connection.',
      extendedDescription: 'The provided database connection instance must still be active. Only database connection instances created by the `getConnection()` machine in this driver are supported.',
      example: '===',
      required: true
    }

  },


  exits: {

    success: {
      outputVariableName: 'isProbablyPostgreSQLConnection',
      outputDescription: 'If the provided appears to be a valid PostgreSQL connection instance.',
      example: true
    },

  },


  fn: function validateConnection(inputs, exits) {
    var _ = require('lodash');

    // Validate some basic assertions about the provided connection.
    // (this doesn't guarantee it's still active or anything, but it does let
    //  us know that it at least _HAS_ the properly formatted methods and properties
    //  necessary for internal use in this Waterline driver)

    if (!inputs.connection.connection) {
      return exits.badConnection();
    }

    return exits.success(
      _.isObject(inputs.connection.connection) &&
      _.isFunction(inputs.connection.connection.release) &&
      _.isFunction(inputs.connection.connection.query)
    );
  }


});
