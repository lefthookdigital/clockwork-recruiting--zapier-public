const getAttachment = async (z, bundle) => {
  let response = await z.request({
    url: bundle.inputData.url,
    method: 'GET'
  })

  return response.data.person
}

const addAttachment = async (z, bundle) => {
  let response = await z.request({
    url: 'https://api.clockworkrecruiting.com/v1/{firm_subdomain}/people/{{bundle.inputData.person_id}}',
    method: 'POST'
  })

  return ''
}

const makeRequest = (z, bundle) => {
  const scripting = require('../scripting')
  const legacyScriptingRunner = require('zapier-platform-legacy-scripting-runner')(scripting)

  bundle._legacyUrl = 'https://api.clockworkrecruiting.com/v1/{{firm_subdomain}}/people/{{person_id}}'
  bundle._legacyUrl = replaceVars(bundle._legacyUrl, bundle)

  // Do a _pre_write() from scripting.
  const preWriteEvent = {
    name: 'create.pre',
    key: 'add_attachment'
  }
  return legacyScriptingRunner
    .runEvent(preWriteEvent, z, bundle)
    .then(preWriteResult => z.request(preWriteResult))
    .then(response => {
      response.throwForStatus()

      // Do a _post_write() from scripting.
      const postWriteEvent = {
        name: 'create.post',
        key: 'add_attachment',
        response
      }
      return legacyScriptingRunner.runEvent(postWriteEvent, z, bundle)
    })
}

module.exports = {
  key: 'add_attachment',
  noun: 'Add_attachment',

  display: {
    label: 'Add Attachment to Person',
    description: 'Adds a file as an attachment to a person.',
    hidden: false,
    important: true
  },

  operation: {
    inputFields: [
      {
        key: 'attachment_type',
        label: 'Attachment Type',
        helpText: 'Please choose the attachment type for this file from the available dropdown.',
        type: 'string',
        required: true,
        choices: { resume: 'Resume', 'old resume': 'Old Resume', references: 'References', other: 'Other' }
      },
      {
        key: 'person_id',
        label: 'Person Id',
        helpText:
          'Please enter the person Id. Note person can be found using a variety of fields by using the Find Person search.',
        type: 'integer',
        required: true,
        search: 'person.id'
      },
      {
        key: 'url',
        label: 'File',
        helpText: 'The file to add as an attachment.',
        type: 'string',
        required: true
      }
    ],
    outputFields: [],
    perform: makeRequest,
    sample: {
      address: '2030 Franklin St, Suite 202, Oakland, CA, 94612',
      emailAddress: 'christian@clockworkrecruiting.com',
      externalRef: null,
      firstName: 'Christian',
      homeAddress: null,
      homeEmailAddress: null,
      homePhoneNumber: null,
      id: 885944,
      initials: 'CS',
      lastName: 'Spletzer',
      linkedinUrl: 'https://www.linkedin.com/in/christianspletzer',
      middleName: null,
      mobilePhoneNumber: null,
      name: 'Christian Spletzer',
      otherAddress: null,
      otherEmailAddress: 'christian@clockworkrecruiting.com',
      otherPhoneNumber: null,
      phoneNumber: '(510) 629-4494',
      pictureUrl:
        'https://clockwork-images.s3-us-west-2.amazonaws.com/person_image/000/000/002/430/1fb2a1c/182b641_wide_large_icon.jpg?1440877787',
      position: 'Founder / CEO at Clockwork Recruiting, 1/2010 to present',
      positionCompany: 'Clockwork Recruiting',
      positionEnd: null,
      positionStart: '1/2010',
      positionTitle: 'Founder / CEO',
      prefix: null,
      suffix: null,
      tag: 'CEO;Clockwork Recruiting',
      updatedAt: 1479372140,
      version: 4,
      workAddress: '2030 Franklin St, Suite 202, Oakland, CA, 94612',
      workEmailAddress: null,
      workPhoneNumber: '(510) 629-4494'
    }
  }
}
