import { getSqlPool } from '../db_middleware/user_db.js'; // Import the pool getter
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Initialize OpenAI Client
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.AZURE_OPENAI_KEY;
const openAIClient = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
const deploymentId = "sql-mi";

// OpenAI Controller Functions
const Chatbot = async (req, res) => {
    const userQuery = req.body.userQuery;
    const messages = req.body.messageHistory;

    if (!userQuery || !messages) {
        return res.status(400).send("No user query or message history provided");
    }

    try {
        const pool = await getSqlPool();
        const sqlDatabasesAvailable = await pool.request().query(`SELECT name FROM master.sys.databases`);
        const databaseList = sqlDatabasesAvailable.recordset;
        const sysDatabases = ["master", "StockDB"];

        let databasesTablesColumns = [];
        for (const database of databaseList) {
            if (!sysDatabases.includes(database.name)) {
                const result = await pool.request().query(`
                    USE ${database.name};
                    SELECT 
                        t.TABLE_NAME,
                        c.COLUMN_NAME,
                        c.DATA_TYPE
                    FROM INFORMATION_SCHEMA.TABLES t
                    JOIN INFORMATION_SCHEMA.COLUMNS c 
                    ON t.TABLE_NAME = c.TABLE_NAME
                    WHERE t.TABLE_TYPE = 'BASE TABLE'
                    ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;
                `);

                const tablesAndColumns = {
                    databaseName: database.name,
                    tables: [],
                };

                result.recordset.forEach(row => {
                    let existingTable = tablesAndColumns.tables.find(t => t.tableName === row.TABLE_NAME);
                    if (!existingTable) {
                        existingTable = { tableName: row.TABLE_NAME, columns: [] };
                        tablesAndColumns.tables.push(existingTable);
                    }
                    existingTable.columns.push({ columnName: row.COLUMN_NAME, dataType: row.DATA_TYPE });
                });
                databasesTablesColumns.push(tablesAndColumns);
            }
        }

        let messageHistory = [...messages, {
            role: "system",
            content: "Here is the JSON with all databases, tables, and columns: " + JSON.stringify(databasesTablesColumns)
        }, userQuery];

        const getUpdatedMessageHistory = await getChatGptAnswerObjectWithFunction(messageHistory, databasesTablesColumns);

        if (getUpdatedMessageHistory) {
            res.send(JSON.stringify(getUpdatedMessageHistory));
        } else {
            res.send(JSON.stringify(messageHistory));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};

async function getChatGptAnswerObjectWithFunction(messages, databasesTablesColumns) {
    try {
        const chatCompletions = await openAIClient.getChatCompletions(deploymentId, messages, createOptions(databasesTablesColumns));
        const choice = chatCompletions.choices[0];
        const responseMessage = choice.message;

        if (responseMessage?.toolCalls?.length) {
            const toolCallResults = await Promise.all(responseMessage.toolCalls.map(applyToolCall));
            const resolutionMessages = [...messages, responseMessage, ...toolCallResults];
            const result = await openAIClient.getChatCompletions(deploymentId, resolutionMessages);
            return [...messages, result.choices[0].message];
        } else {
            return [...messages, responseMessage];
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function createOptions(databaseSchemaString) {
    return {
        tools: [
            {
                type: "function",
                function: {
                    name: "askDatabase",
                    description: "Query database using SQL.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: `SQL query based on schema: ${databaseSchemaString}`,
                            },
                        },
                        required: ["query"],
                    },
                },
            },
        ],
    };
}

async function applyToolCall({ function: call }) {
    if (call.name === "askDatabase") {
        const { query } = JSON.parse(call.arguments);
        try {
            const pool = await getSqlPool(); // Use shared pool here
            const result = await pool.request().query(query);
            return { role: "tool", content: JSON.stringify(result.recordset) };
        } catch (error) {
            console.error(error);
            return { role: "tool", content: `Error: ${error.message}` };
        }
    }
    throw new Error(`Unknown tool call: ${call.name}`);
}

module.exports = { Chatbot };



export const sqlQueries = async (req, res) => {
  try {
    const { query } = req.body;  // Get the SQL query from the request body

    // Ensure that the query is provided and is a string
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid SQL query format' });
    }

    // Get the SQL connection pool
    const pool = await getSqlPool();

    // Execute the SQL query using the pool
    const result = await pool.request().query(query);

    // Check if results are present and send them
    if (result && result.recordset) {
      res.json({ results: result.recordset });
    } else {
      res.status(404).json({ error: 'No results found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error executing query: ' + error.message });
  }
};


export const SQLChatBot = async (req, res) => {
  const { query } = req.body;

  try {
    const [results] = await sequelize.query(query);
    let responseMessage;

    if (Array.isArray(results)) {
      if (results.length === 0) {
        responseMessage = "I found no records matching your query.";
      } else {
        responseMessage = `I found ${results.length} record(s). Here's a summary: ${JSON.stringify(results, null, 2)}`;
      }
    } else {
      responseMessage = "The operation was successful.";
    }

    res.json({ answer: responseMessage });
  } catch (error) {
    res.status(500).json({ answer: `Oops, something went wrong: ${error.message}` });
  }
};