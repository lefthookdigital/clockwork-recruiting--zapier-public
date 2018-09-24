// Created by 'zapier convert'. This is just a stub - you will need to edit!

const authentication = require('./authentication')
const PeopleloadedTrigger = require('./triggers/people_loaded')
const PeopleupdatedTrigger = require('./triggers/people_updated')
const TimestampTrigger = require('./triggers/timestamp')
const PersonSearch = require('./searches/person')
const PersonSearchOrCreate = require('./searches/search_or_create.js')
const AddattachmentCreate = require('./creates/add_attachment')
const AddnoteCreate = require('./creates/add_note')
const CreatepersonCreate = require('./creates/create_person')
const CreatepersonbasicCreate = require('./creates/create_person_basic')

const formatForClockwork = (request, z, bundle) => {
  request.headers['X-Api-Key'] = '44OUQAAP5u42jmj7huAjG9IkkAhFx9H6XxV2B9K7'
  request.headers.authorization = `bearer ${bundle.authData.sessionKey}`
  request.url = request.url.replace('{bundle.authData.firm_subdomain}', bundle.authData.firm_subdomain || 'account')
  return request
}

const checkForError = (response, z, bundle) => {
  if (response.status === 500) {
    throw Error('Internal error')
  }
  if (response.status === 400) {
    let error = response.json.data.message
    throw new Error(error)
  }
  return response
}

const refreshAuth = (response, z, bundle) => {
  if (response.status === 401 && bundle.authData.sessionKey) {
    throw new z.errors.RefreshAuthError()
  }
  return response
}
// after app to look for error codes and format.
const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [formatForClockwork],

  afterResponse: [
    refreshAuth,
    checkForError
  ],

  resources: {},

  triggers: {
    [PeopleloadedTrigger.key]: PeopleloadedTrigger,
    [PeopleupdatedTrigger.key]: PeopleupdatedTrigger,
    [TimestampTrigger.key]: TimestampTrigger
  },

  searches: {
    [PersonSearch.key]: PersonSearch
  },

  creates: {
    [AddattachmentCreate.key]: AddattachmentCreate,
    [AddnoteCreate.key]: AddnoteCreate,
    [CreatepersonCreate.key]: CreatepersonCreate,
    [CreatepersonbasicCreate.key]: CreatepersonbasicCreate
  },

  searchOrCreates: {
    person: {
      key: 'person',
      display: {
        label: 'Find or Create Person',
        description: 'Find or Create Person'
      },
      search: 'person',
      create: 'create_person_basic'
    }
  }
}

module.exports = App
