const mongoClient = require('mongodb').MongoClient

const logger = require('../helper/logging')

let connection
let gamesCollection

const connect = async (callback) => {
  // local address used for development, else use mongo image from docker
  const mongoAddress = process.env.LOCAL ? '127.0.0.1' : 'mongo'
  const mongoPort = process.env.BS_MONGO_PORT ? process.env.BS_MONGO_PORT : '27017'
  return mongoClient.connect(`mongodb://${mongoAddress}:${mongoPort}/BOX_SCORE`, { useNewUrlParser: true }).then((conn) => {
    connection = conn
    gamesCollection = conn.db('BOX_SCORE').collection('games')
    return callback
  }).catch((err) => {
    const logMessage = `[mongoAdapter - connect - ${err}]`
    logger.log('error', logMessage)
    throw err
  })
}

const closeConnection = async () => {
  await connection.close()
}

const getConnection = () => (connection)

const getGamesCollection = () => (gamesCollection)

const upsertGame = async (game) => (
  new Promise(async (resolve, reject) => {
    try {
      const result = await gamesCollection.updateOne(
        { src_id: game.src_id },
        { $set: { updated_at: Date.now(), ...game } },
        { upsert: true },
      )
      if (result.result.n === 1) {
        resolve()
      } else {
        logger.error(`[mongoAdapter - upsertGame] - Failed to upsert game for given id: ${game.src_id}`)
        reject(new Error(`Failed to upsert game for given id: ${game.src_id}`))
      }
    } catch (err) {
      logger.error(`[mongoAdapter - upsertGame] - Error upserting game: ${err}`)
      reject(err)
    }
  })
)

const findGames = async (query = {}) => (
  new Promise(async (resolve, reject) => {
    try {
      const cursor = await gamesCollection.find(query).sort({ _id: -1 })
      const games = cursor.toArray()
      resolve(games)
    } catch (err) {
      logger.error(`[mongoAdapter - findGames(${query})] - Error finding game: ${err}`)
      reject(err)
    }
  })
)

const findSingleGame = async (eventInformation) => (
  new Promise(async (resolve, reject) => {
    try {
      const games = await findGames(eventInformation)
      resolve(games[0])
    } catch (err) {
      logger.error(`[mongoAdapter - findSingleGame(${eventInformation})] - Error finding game: ${err}`)
      reject(err)
    }
  })
)

const clearGamesCollection = async () => (
  new Promise(async (resolve, reject) => {
    try {
      await gamesCollection.deleteMany()
      logger.info('[mongoAdapter - clearGamesCollection] - Successfully cleared Mongo cache')
      resolve()
    } catch (err) {
      reject(err)
    }
  })
)

module.exports = {
  connect,
  closeConnection,
  getConnection,
  getGamesCollection,
  upsertGame,
  findGames,
  findSingleGame,
  clearGamesCollection,
}
