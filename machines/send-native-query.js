module.exports = {


  friendlyName: 'Send native query',


  description: 'Send a native query to the PostgreSQL database.',


  inputs: {

    connection:
      require('../constants/connection.input'),

    nativeQuery: {
      description: 'A native query for the PostgreSQL database.',
      extendedDescription: 'This is oftentimes compiled from Waterline query syntax using "Compile statement", however it could also originate from userland code.',
      example: '*',
      moreInfoUrl: 'https://github.com/brianc/node-postgres/wiki/Query#result-object',
      required: true
    },

    meta:
      require('../constants/meta.input')

  },


  exits: {

    success: {
      description: 'The native query was executed successfully.',
      outputVariableName: 'report',
      outputDescription: 'The `result` property is the result data the database sent back.  The `meta` property is reserved for custom adapter-specific extensions.',
      moreInfoUrl: 'https://github.com/brianc/node-postgres/wiki',
      example: {
        result: '*',
        meta: '==='
      }
    },

    badConnection:
      require('../constants/badConnection.exit'),

    notUnique: {
      friendlyName: 'Not unique',
      description: 'The provided query failed because it would violate one or more uniqueness constraints.',
      outputVariableName: 'report',
      outputDescription: 'The `columns` property is an array containing the names of columns with uniquness constraint violations. The `error` property is a JavaScript Error instance containing the raw error from the database.  The `meta` property is reserved for custom adapter-specific extensions.',
      example: {
        columns: [ 'email_address' ],
        error: '===',
        meta: '==='
      }
    }

  },


  fn: function (inputs, exits) {
    var util = require('util');

    // Validate provided connection.
    if ( !util.isObject(inputs.connection) || !util.isFunction(inputs.connection.release) || !util.isObject(inputs.connection.client) ) {
      return exits.badConnection();
    }

    // Validate query
    // (supports raw SQL string or dictionary consisting of `sql` and `bindings` properties)
    var sql;
    var bindings;
    if ( util.isString(inputs.nativeQuery) ) {
      sql = inputs.nativeQuery;
      bindings = [];
    }
    else if ( util.isObject(inputs.nativeQuery) && util.isString(inputs.nativeQuery.sql) && util.isArray(inputs.nativeQuery.bindings) ) {
      sql = inputs.nativeQuery.sql;
      bindings = inputs.nativeQuery.bindings;
    }
    else {
      return exits.error(new Error('Provided `nativeQuery` is invalid.  Please specify either a string of raw SQL or a dictionary like `{sql: \'SELECT * FROM dogs WHERE name = $1\', bindings: [\'Rover\']}`.'));
    }

    // Send native query
    inputs.connection.client.query(sql, bindings, function query(err, result) {
      if (err) {
        // TODO: negotiate `notUnique` error.
        //
        // For implementation help w/ building `columns`, see:
        //  • https://github.com/balderdashy/sails-postgresql/blob/a51b3643777dcf1af5517acbf76e09612d36b301/lib/adapter.js#L1308
        return exits.error(err);
      }

      // The other properties on `result` are not very well documented
      // so we _could_ probably just return `result.rows`.  But just in case,
      // and for completeness, we currently include all properties that are
      // documented in node-postgres.  For more information, see:
      //  • https://github.com/brianc/node-postgres/wiki/Query#result-object
      return exits.success({
        result: {
          command: result.command,
          rowCount: result.rowCount,
          oid: result.oid,
          rows: result.rows
        }
      });
    });
  }


};
