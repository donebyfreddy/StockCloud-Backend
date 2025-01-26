import { Sequelize } from 'sequelize';
import sql from 'mssql'

const sequelizeDB = new Sequelize({
  dialect: 'mssql',
  host: String(process.env.DB_SERVER), 
  username: String(process.env.DB_USER),  // Using environment variable for username
  password: String(process.env.DB_PASSWORD),  // Using environment variable for password
  database: String(process.env.DB_NAME),  // Using environment variable for database name
  port: parseInt(process.env.DB_PORT),  // Default port 1433 if not set in env
  dialectOptions: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

// SQL Connection Configuration using environment variables
console.log(process.env);  // Prints all environment variables

const sqlDBConfig = {
  user: String(process.env.DB_USER),  // Using environment variable for username
  password: String(process.env.DB_PASSWORD),  // Using environment variable for password
  server: String(process.env.DB_SERVER),  // Using environment variable for host
  database: String(process.env.DB_NAME),  // Using environment variable for database name
  port: parseInt(process.env.DB_PORT) || 1433,  // Default port 1433 if not set in env
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};


// Create the connection pool
let sqlDBPool;

// Function to initialize the connection pool once and return it
const initSqlPool = async () => {
  if (!sqlDBPool) {
    try {
      sqlDBPool = await sql.connect(sqlDBConfig); // Create the pool
      console.log('✅ SQL Connection Pool created successfully');
    } catch (error) {
      console.error('❌ Error connecting to SQL Server:', error.message);
      throw new Error('Failed to initialize SQL connection pool');
    }
  }
  return sqlDBPool;
};

// Function to get the current pool
const getSqlPool = async () => {
  await initSqlPool(); // Ensure the pool is initialized
  return sqlDBPool; // Return the existing pool
};



const connectdb = async () => {
  const connect = async () => {
    try {
      await sequelizeDB.authenticate();
      console.log(`✅ Database connected with host: ${sequelizeDB.config.host}`);


    } catch (error) {
      console.error("❌ Error connecting to SQL Server:", error.message);
      setTimeout(connect, 3000); // Retry after 3 seconds
    }
  };

  // Error handling - You can simplify or remove if not needed
  // sequelizeDB.addHook('beforeDisconnect', () => {
  //   console.warn("⚠️ SQL Server disconnected! Attempting to reconnect...");
  // });

  // sequelizeDB.addHook('error', (err) => {
  //   console.error("❌ SQL Server connection error:", err.message);
  // });

  // Initial connection attempt
  connect();
};

export { connectdb, getSqlPool };
export default sequelizeDB;
