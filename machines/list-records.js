module.exports = {


  friendlyName: 'List records',


  description: 'List records in the Postgresql table that match the specified criteria.',


  extendedDescription: '',


  inputs: {

    connectionUrl: {
      description: 'The postgresql connection URL',
      defaultsTo: 'postgres://foo:bar@localhost:5432/machinepack_postgresql',
      example: 'postgres://foo:bar@localhost:5432/machinepack_postgresql',
      required: true
    },

    table: {
      description: 'The name of the table.',
      example: 'direwolves',
      required: true
    },

    query: {
      description: 'The selection criteria (like the WHERE clause)',
      extendedDescription: 'Standard query selectors from the Postgresql method.',
      typeclass: 'dictionary'
    },

    limit: {
      description: 'If specified, limits number of rows returned in the query (useful for pagination)',
      example: 30
    },

    skip: {
      description: 'If specified, skips N rows ahead in the query (useful for pagination)',
      example: 30
    },

    sort: {
      description: 'If specified, the rows coming back from the query will be sorted according to this dictionary.',
      typeclass: 'array'
    },

    schema: {
      description: 'An example indicating what each returned row should look like.',
      extendedDescription: 'This is used to determine the `columns` (i.e. projection) passed in w/ the query.',
      typeclass: 'array',
      required: true
    }

  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred.',
    },

    couldNotConnect: {
      description: 'Could not connect to Postgresql server at specified `connectionUrl`.',
      extendedDescription: 'Make sure the credentials are correct and that the server is running.'
    },

    invalidCollection: {
      description: 'Provided `table` input is not a valid name for a Postgresql table.',
    },

    success: {
      description: 'Returns an array of records.',
      getExample: function (inputs) {

        // Handle type management
        var schema = inputs.schema;
        var example = {};

        schema.forEach(function(column) {
          var type = column.type;
          switch(type) {
            case 'string':
              example[column.fieldName] = 'abc';
              break;
            case 'number':
              example[column.fieldName] = 123;
              break;

            // Must be a stringified version
            case 'dictionary':
              example[column.fieldName] = '{"foo":"bar"}';
              break;

            // Must be a stringified version
            case 'array':
              example[column.fieldName] = '[1]';
              break;
          };
        });

        return [example];
      }
    }

  },


  fn: function (inputs,exits) {

    // Dependencies
    var pg = require('pg');
    var wlSQL = require('waterline-sequel');

    // Rename inputs for clarity
    var table = inputs.table;
    var schema = inputs.schema;
    var query = {
      where: inputs.query || null
    };

    if(inputs.limit) query.limit = inputs.limit;
    if(inputs.skip) query.skip = inputs.skip;
    if(inputs.sort) {
      query.sort = {};

      // Parse array and turn into a WL sort criteria
      inputs.sort.forEach(function(sorter) {
        query.sort[sorter.columnName] = sorter.direction;
      });
    }

    // WL SQL options
    var sqlOptions = {
      parameterized: true,
      caseSensitive: true,
      escapeCharacter: '"',
      casting: true,
      canReturnValues: true,
      escapeInserts: true,
      declareDeleteAlias: false,
      wlNext: {
        caseSensitive: true
      }
    };

    var normalizedSchema = {};
    var attributes = {};

    schema.forEach(function(column) {
      attributes[column.fieldName] = {
        type: column.type
      };
    });

    normalizedSchema[table] = {
      tableName: table,
      identity: table,
      attributes: attributes
    };

    // Build the SQL query based on the query inputs
    var sequel = new wlSQL(normalizedSchema, sqlOptions);
    var sql;

    // Build a query for the specific query strategy
    try {
      sql = sequel.find(table, query);
    } catch (e) {
      return exits.error(e);
    }

    // Create a new postgresql client
    var client = new pg.Client(inputs.connectionUrl);
    client.connect(function(err) {

      if(err) {
        return exits.error(err);
      }

      client.query(sql.query[0], function(err, results) {
        client.end();

        if(err) {
          return exits.error(err);
        }

        return exits.success(results.rows);
      });
    });
  }

};
