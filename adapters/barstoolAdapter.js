const axios = require('axios')

const logger = require('../helper/logging')

const getGameById = async (gameId) => {
  const url = `https://chumley.barstoolsports.com/dev/data/games/${gameId}.json`
  const request = {
    method: 'GET',
    url,
  }

  let response
  try {
    response = await axios.request(request)
  } catch (error) {
    const logMessage = `[barstoolAdapter - getGameById(${gameId}) - ${error.response.status} - ${error.response.data}]`
    logger.log('error', logMessage)
    throw error
  }

  return response.data
}

const gameIdMap = {
  NBA: '6c974274-4bfc-4af8-a9c4-8b926637ba74',
  MLB: 'eed38457-db28-4658-ae4f-4d4d38e9e212',
}

module.exports = {
  getGameById,
  gameIdMap,
}
