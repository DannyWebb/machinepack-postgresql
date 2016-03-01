/**
 * Note that this helper module exports a "wet" (i.e. ready-to-call)
 * machine instance; not just a dry definition.
 *
 * @type {Function}
 */
module.exports = require('machine').build({


  friendlyName: 'Validate connection',


  description: 'Check if this looks like a valid PostgreSQL connection instance.',


  cacheable: true,


  sync: true,


  inputs: {

    connection:
      require('../constants/connection.input'),

  },


  exits: {

    success: {
      outputVariableName: 'isProbablyPostgreSQLConnection',
      outputDescription: 'If the provided appears to be a valid PostgreSQL connection instance.',
      example: true
    },

  },


  fn: function (inputs, exits) {
    var util = require('util');

    // Validate some basic assertions about the provided connection.
    // (this doesn't guarantee it's still active or anything, but it does let
    //  us know that it at least _HAS_ the properly formatted methods and properties
    //  necessary for internal use in this Waterline driver)
    return exits.success(
      util.isObject(inputs.connection) &&
      util.isFunction(inputs.connection.release) &&
      util.isObject(inputs.connection.client) &&
      util.isFunction(inputs.connection.client.query)
    );
  }


});
