// Created by 'zapier convert'. This is just a stub - you will need to edit!

const authentication = require('./authentication')
const PeopleloadedTrigger = require('./triggers/people_loaded')
const PeopleupdatedTrigger = require('./triggers/people_updated')
const TimestampTrigger = require('./triggers/timestamp')
const PersonSearch = require('./searches/person')
const AddattachmentCreate = require('./creates/add_attachment')
const AddnoteCreate = require('./creates/add_note')
const CreatepersonCreate = require('./creates/create_person')
const CreatepersonbasicCreate = require('./creates/create_person_basic')

const formatForClockwork = (request, z, bundle) => {
  if (request.url.indexOf('/stage_v') !== -1) {
    request.headers['X-Api-Key'] = 'tlM1TGQIRY1YpPOSFsXU16JGAKk8SyVP6MSahp8k'
  } else if (request.url.indexOf('/sandbox_v') !== -1) {
    request.headers['X-Api-Key'] = '8OzLJSq8bvIOtMHm55Pv8BLMcXufjWcaEBdHZN7d'
  } else {
    request.headers['X-Api-Key'] = 'gkuCcomxcF7s30tKlJR0Z5U4DHY424KG7RLXPRyj'
  }

  request.url = request.url.replace('{firm_subdomain}', bundle.authData.firm_subdomain || 'account')
  return request
}

const checkForError = (response, z, bundle) => {
  // ensure that the error code for auth it 401.
  if (response.status > 200 && response.status !== 401 && response.status !== 404) {
    // see how to throw errors here. are they in the body? need oauth apps.
  }
}
// after app to look for error codes and format.
const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [formatForClockwork],

  afterResponse: [],

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