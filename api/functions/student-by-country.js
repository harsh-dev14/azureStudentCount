const { ConnectionPool } = require('mssql');

module.exports = async function (context, req) {
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
      encrypt: true, // Use encryption to ensure secure connection
      enableArithAbort: true, // Recommended for better error handling with arithmetic queries
    },
  };

  // Initialize connection pool
  let pool;
  try {
    pool = await new ConnectionPool(config).connect();

    // Perform the database query
    const result = await pool
      .request()
      .query(
        'SELECT Country, COUNT(*) AS StudentCount FROM Students GROUP BY Country'
      );

    // Send successful response
    context.res = {
      status: 200,
      body: result.recordset,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    // Enhanced error handling with specific feedback
    console.error('Database query failed:', err);

    const statusCode = err.code === 'ELOGIN' ? 401 : 500; // Unauthorized for login errors
    context.res = {
      status: statusCode,
      body: { error: 'Failed to retrieve data', details: err.message },
    };
  } finally {
    // Ensure pool closure
    if (pool) {
      await pool.close();
    }
  }
};
