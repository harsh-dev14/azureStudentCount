const { ConnectionPool } = require('mssql');

module.exports = async function (context, req) {
  // SQL database configuration from environment variables
  const config = {
    user: process.env.SQL_USER, // SQL username
    password: process.env.SQL_PASSWORD, // SQL password
    server: process.env.SQL_SERVER, // SQL server name
    database: process.env.SQL_DATABASE, // SQL database name
    options: {
      encrypt: true, // Encrypt connection (use for Azure SQL)
      enableArithAbort: true, // Recommended setting for error handling
    },
  };

  let pool;
  try {
    // Establish connection to SQL Server
    pool = await new ConnectionPool(config).connect();

    // Query to get student count by country
    const result = await pool
      .request()
      .query(
        'SELECT Country, COUNT(*) AS StudentCount FROM Students GROUP BY Country'
      );

    // Return the result as JSON response
    context.res = {
      status: 200,
      body: result.recordset,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    // Log the error and return a 500 error response
    console.error('SQL Query Error: ', err);
    context.res = {
      status: 500,
      body: { error: 'Error retrieving data from SQL', details: err.message },
    };
  } finally {
    // Ensure pool closure after query execution
    if (pool) await pool.close();
  }
};
