'use strict';


// START: HEADER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v1.2.0
const _ = require('lodash');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const crypto = require('crypto');
const async = require('async');
const moment = require('moment-timezone');
const {
    DOMParser,
    XMLSerializer
} = require('xmldom');
const atob = require('zapier-platform-legacy-scripting-runner/atob');
const btoa = require('zapier-platform-legacy-scripting-runner/btoa');
const z = require('zapier-platform-legacy-scripting-runner/z');
const $ = require('zapier-platform-legacy-scripting-runner/$');
const {
    ErrorException,
    HaltedException,
    StopRequestException,
    ExpiredAuthException,
    RefreshTokenException,
    InvalidSessionException,
} = require('zapier-platform-legacy-scripting-runner/exceptions');
// END: HEADER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v1.2.0

var Zap = {





    // ===================================
    // Utility methods
    // ===================================

    // configure each request, adding the Api Key and updating the firm name in the URL
    clockworkRequest: function (bundle) {
        var request = bundle.request;

        // use appropriate stage api key
        if (request.url.indexOf('/stage_v') !== -1) {
            request.headers["X-Api-Key"] = "tlM1TGQIRY1YpPOSFsXU16JGAKk8SyVP6MSahp8k";
        } else if (request.url.indexOf('/sandbox_v') !== -1) {
            request.headers["X-Api-Key"] = "8OzLJSq8bvIOtMHm55Pv8BLMcXufjWcaEBdHZN7d";
        } else {
            request.headers["X-Api-Key"] = "gkuCcomxcF7s30tKlJR0Z5U4DHY424KG7RLXPRyj";
        }

        request.url = request.url.replace('{bundle.authData.firm_subdomain}', bundle.auth_fields.bundle.authData.firm_subdomain 'account');
        return request;
    },

    // return person from JSON results
    returnedPerson: function (bundle) {
        var result = z.JSON.parse(bundle.response.content);
        if (result.data && result.data.person) {
            return [result.data.person];
        }

        return [];
    },

    // return people from JSON results
    returnedPeople: function (bundle) {
        var result = z.JSON.parse(bundle.response.content);
        if (result.data && result.data.people && result.data.people.records) {
            return result.data.people.records;
        }

        return [];
    },


    // ===================================
    // Auth
    // ===================================

    // get oauth token
    pre_oauthv2_token: function (bundle) {
        return Zap.clockworkRequest(bundle);
    },



    // refresh oauth token
    pre_oauthv2_refresh: function (bundle) {
        return Zap.clockworkRequest(bundle);
    },


    // ===================================
    // Triggers
    // ===================================

    // test trigger pre
    timestamp_pre_poll: function (bundle) {
        return Zap.clockworkRequest(bundle);
    },

    // test trigger post
    timestamp_post_poll: function (bundle) {
        var result = JSON.parse(bundle.response.content);
        return [result.data];
    },



    // recently updated people poll pre
    people_updated_pre_poll: function (bundle) {
        // convert offset to unix timestamp
        var offset = 172800; //2 days in seconds. Suggested time window for polling.

        var newOrUpdate = bundle.trigger_fields.new_updated;
        var tags = bundle.trigger_fields.tag;
        var now = new Date();
        var since = Math.floor(((now.getTime() + (now.getTimezoneOffset() * 60 * 1000)) / 1000)) - offset;

        if (newOrUpdate === "new") {
            bundle.request.params.loadedAfter = since;
            bundle.request.params.sort = "-loadedAt";
        } else {
            bundle.request.params.updatedAfter = since;
            bundle.request.params.sort = "-updatedAt";

        }
        if (bundle.trigger_fields.tag !== undefined) {
            bundle.request.params.tags = bundle.trigger_fields.tag;
        }

        return Zap.clockworkRequest(bundle);
    },

    // recently updated people poll post
    people_updated_post_poll: function (bundle) {
        return Zap.returnedPeople(bundle);
    },


    // ===================================
    // Actions
    // ===================================

    /********************Create Person Advanced*********************/
    create_person_pre_write: function (bundle) {
        var data = JSON.parse(bundle.request.data);
        delete data.id_value;
        var addresses = [];

        //check for address fields for home address
        if (bundle.action_fields_full.home_address_street1 !== undefined) {
            var homeAddress = {};
            homeAddress.street = bundle.action_fields_full.home_address_street1;
            homeAddress.location = "home";

            if (bundle.action_fields_full.home_address_street2 !== undefined) {
                homeAddress.street2 = bundle.action_fields_full.home_address_street2;
            }

            if (bundle.action_fields_full.home_address_city !== undefined) {
                homeAddress.city = bundle.action_fields_full.home_address_city;
            }

            if (bundle.action_fields_full.home_address_state !== undefined) {
                homeAddress.state = bundle.action_fields_full.home_address_state;
            }

            if (bundle.action_fields_full.home_address_postal_code !== undefined) {
                homeAddress.postalCode = bundle.action_fields_full.home_address_postal_code;
            }

            if (bundle.action_fields_full.home_address_country !== undefined) {
                homeAddress.country = bundle.action_fields_full.home_address_country;
            }


            addresses.push(homeAddress);
        }
        //check for address fields for work address
        if (bundle.action_fields_full.work_address_street1 !== undefined) {
            var workAddress = {};
            workAddress.street = bundle.action_fields_full.work_address_street1;
            workAddress.location = "work";

            if (bundle.action_fields_full.work_address_street2 !== undefined) {
                workAddress.street2 = bundle.action_fields_full.work_address_street2;
            }

            if (bundle.action_fields_full.work_address_city !== undefined) {
                workAddress.city = bundle.action_fields_full.work_address_city;
            }

            if (bundle.action_fields_full.work_address_state !== undefined) {
                workAddress.state = bundle.action_fields_full.work_address_state;
            }

            if (bundle.action_fields_full.work_address_postal_code !== undefined) {
                workAddress.postalCode = bundle.action_fields_full.home_address_postal_code;
            }

            if (bundle.action_fields_full.work_address_country !== undefined) {
                workAddress.country = bundle.action_fields_full.work_address_country;
            }


            addresses.push(workAddress);
        }
        //check for address fields for other address
        if (bundle.action_fields_full.other_address_street1 !== undefined) {
            var otherAddress = {};
            otherAddress.street = bundle.action_fields_full.other_address_street1;
            otherAddress.location = "other";

            if (bundle.action_fields_full.other_address_street2 !== undefined) {
                otherAddress.street2 = bundle.action_fields_full.other_address_street2;
            }

            if (bundle.action_fields_full.other_address_city !== undefined) {
                otherAddress.city = bundle.action_fields_full.other_address_city;
            }

            if (bundle.action_fields_full.other_address_state !== undefined) {
                otherAddress.state = bundle.action_fields_full.other_address_state;
            }

            if (bundle.action_fields_full.other_address_postal_code !== undefined) {
                otherAddress.postalCode = bundle.action_fields_full.other_address_postal_code;
            }

            if (bundle.action_fields_full.other_address_country !== undefined) {
                otherAddress.country = bundle.action_fields_full.other_address_country;
            }


            addresses.push(otherAddress);
        }

        if (addresses.length !== 0) {
            data.addresses = addresses;
        }

        bundle.request.data = JSON.stringify(data);



        //url to check for person by email
        var url = "https://api.clockworkrecruiting.com/v1/" + bundle.auth_fields.bundle.authData.firm_subdomain + "/people/" + encodeURIComponent(bundle.action_fields_full.emailAddress);

        var requestBundle = Zap.clockworkRequest(bundle);
        console.log(requestBundle);

        //request to check for person by email.
        var request = {
            'method': 'GET',
            'url': url,
            'params': {
                'detail': 'full'
            },
            'headers': requestBundle.headers
        };

        var response = z.request(request);
        console.log(response);

        if (response.status_code === "401") {
            throw new RefreshTokenException('Refresh required');
        }
        if (response.status_code === 200 && bundle.action_fields_full.update_create) {
            var person = JSON.parse(response.content).data.person;
            var id = person.id;
            requestBundle.url += "/" + id;
        }
        if (response.status_code === 200 && !bundle.action_fields_full.update_create) {
            throw new HaltedException('Person with email exists with the given email and update if found is set to no.');
        }


        return requestBundle;
    },

    // person create post
    create_person_post_write: function (bundle) {
        var id = JSON.parse(bundle.response.content).data.person.id;

        var request = {
            'method': 'GET',
            'url': "https://api.clockworkrecruiting.com/v1/" + bundle.auth_fields.bundle.authData.firm_subdomain + "/people/" + id,
            'params': {
                'detail': 'full'
            },
            'headers': bundle.request.headers
        };


        var response = z.request(request);

        var person = JSON.parse(response.content).data.person;
        return person;
    },

    /********************Create Person Basic*********************/
    create_person_basic_pre_write: function (bundle) {
        var data = JSON.parse(bundle.request.data);
        delete data.id_value;


        //check for address fields for home address
        if (bundle.action_fields_full.address_street !== undefined) {
            var addresses = [];
            var address = {};
            address.street = bundle.action_fields_full.address_street;



            if (bundle.action_fields_full.address_location !== undefined) {
                address.location = bundle.action_fields_full.address_location;
            }

            if (bundle.action_fields_full.address_street2 !== undefined) {
                address.street2 = bundle.action_fields_full.address_street2;
            }

            if (bundle.action_fields_full.home_address_city !== undefined) {
                address.city = bundle.action_fields_full.address_city;
            }

            if (bundle.action_fields_full.address_state !== undefined) {
                address.state = bundle.action_fields_full.address_state;
            }

            if (bundle.action_fields_full.address_postal_code !== undefined) {
                address.postalCode = bundle.action_fields_full.address_postal_code;
            }

            if (bundle.action_fields_full.address_country !== undefined) {
                address.country = bundle.action_fields_full.address_country;
            }


            addresses.push(address);
            data.addresses = addresses;
        }


        bundle.request.data = JSON.stringify(data);



        var url = "https://api.clockworkrecruiting.com/v1/" + bundle.auth_fields.bundle.authData.firm_subdomain + "/people/" + encodeURIComponent(bundle.action_fields_full.emailAddress);

        var requestBundle = Zap.clockworkRequest(bundle);
        console.log(requestBundle);

        //request to check for person by email. 
        var request = {
            'method': 'GET',
            'url': url,
            'params': {
                'detail': 'full'
            },
            'headers': requestBundle.headers
        };

        var response = z.request(request);
        console.log(response);

        if (response.status_code === "401") {
            throw new RefreshTokenException('Refresh required');
        }
        if (response.status_code === 200 && bundle.action_fields_full.update_create) {
            var person = JSON.parse(response.content).data.person;
            var id = person.id;
            requestBundle.url += "/" + id;
        }
        if (response.status_code === 200 && !bundle.action_fields_full.update_create) {
            throw new HaltedException('Person with email exists with the given email and update if found is set to no.');
        }


        return requestBundle;
    },

    // person create post
    create_person_basic_post_write: function (bundle) {
        //post write request to retrieve updated person
        var id = JSON.parse(bundle.response.content).data.person.id;

        var request = {
            'method': 'GET',
            'url': "https://api.clockworkrecruiting.com/v1/" + bundle.auth_fields.bundle.authData.firm_subdomain + "/people/" + id,
            'params': {
                'detail': 'full'
            },
            'headers': bundle.request.headers
        };


        var response = z.request(request);

        var person = JSON.parse(response.content).data.person;
        return person;
    },

    /********************Add Note to Person*********************/
    add_note_pre_write: function (bundle) {
        var requestBundle = Zap.clockworkRequest(bundle);

        var data = {
            contentType: bundle.action_fields_full.contnet_type,
            content: bundle.action_fields_full.content,
            entityId: bundle.action_fields_full.person_id
        };

        if (bundle.action_fields_full.catagory !== undefined) {
            data.category = bundle.action_fields_full.catagory;
        }
        var person = {
            notes: [data]
        };

        requestBundle.data = JSON.stringify(person);

        return requestBundle;
    },


    add_note_post_write: function (bundle) {

        //post write request to retrieve updated person
        var id = JSON.parse(bundle.response.content).data.person.id;

        var request = {
            'method': 'GET',
            'url': "https://api.clockworkrecruiting.com/v1/" + bundle.auth_fields.bundle.authData.firm_subdomain + "/people/" + id,
            'params': {
                'detail': 'full'
            },
            'headers': bundle.request.headers
        };


        var response = z.request(request);

        var person = JSON.parse(response.content).data.person;
        return person;
    },

    /********************Add Note to Attachment*********************/
    add_attachment_pre_write: function (bundle) {

        var request = {
            'method': 'GET',
            'url': bundle.action_fields_full.url,
            'headers': bundle.request.headers,
            encoding: null
        };

        var response = z.request(request);

        var contentType = response.headers["content-type"];

        var header = response.headers["content-disposition"];

        var fileName = header.split("filename=")[1].replace('\"', "").replace('\"', "");

        console.log(fileName);


        console.log(response.content);

        var requestBundle = Zap.clockworkRequest(bundle);

        var attachment = {};

        attachment.attachmentType = bundle.action_fields_full.attachment_type;
        attachment.url = bundle.action_fields_full.url;
        attachment.contentType = contentType;
        attachment.fileName = fileName;


        var person = {};

        person.attachments = [attachment];

        requestBundle.data = JSON.stringify(person);

        return requestBundle;
    },

    add_attachment_post_write: function (bundle) {

        //post write request to retrieve updated person
        var id = JSON.parse(bundle.response.content).data.person.id;

        var request = {
            'method': 'GET',
            'url': "https://api.clockworkrecruiting.com/v1/" + bundle.auth_fields.bundle.authData.firm_subdomain + "/people/" + id,
            'params': {
                'detail': 'full'
            },
            'headers': bundle.request.headers
        };


        var response = z.request(request);
        //console.log(response);

        var person = JSON.parse(response.content).data.person;

        return person;
    },

    // ===================================
    // Searches
    // ===================================

    // person search
    //   can't just use pre- and post- hooks because we have to catch 404 and convert to []
    person_search: function (bundle) {
        // check arguments and extract id value to use
        var id_value = encodeURIComponent(bundle.search_fields.id_value);


        // replace argument in request url
        bundle.request.url = bundle.request.url.replace('{{id_value}}', id_value);

        // issue synchronous request
        bundle.request = Zap.clockworkRequest(bundle);

        // process response, returning [] if object not found
        bundle.response = z.request(bundle.request);
        if (bundle.response.status_code == 404) {
            return [];
        }

        return Zap.returnedPerson(bundle);
    },


    // person search pre, actual find-by-id call
    person_pre_read_resource: function (bundle) {
        return Zap.clockworkRequest(bundle);
    },

    // person search post, actual find-by-id call
    person_post_read_resource: function (bundle) {
        var results = Zap.returnedPerson(bundle);

        // this routine should only be called if there were, in fact, results,
        // so there should always be our result wrapped in an array, which we unwrap.
        if (results) {
            return results[0];
        }

        return results;
    }
};

// START: FOOTER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v1.2.0
module.exports = Zap;
// END: FOOTER -- AUTOMATICALLY ADDED FOR COMPATIBILITY - v1.2.0

let dog = {
    "id": 4456601,
    "version": 9,
    "name": "Test Person",
    "prefix": "Mr",
    "firstName": "Test",
    "middleName": "Danger",
    "lastName": "Person",
    "suffix": "Jr",
    "initials": "TDP",
    "biography": "A well known international spy",
    "assistantName": "Assistant Placeholder",
    "skypeName": "test_danger_person",
    "doNotContact": false,
    "noRelocation": false,
    "createdAt": "2018-09-13T06:35:09+00:00",
    "updatedAt": "2018-09-24T16:05:44+00:00",
    "loadedAt": "2018-09-13T06:35:09+00:00",
    "pictureUrls": "http://www.pictureUrls.com",
    "externalRefs": [{
        "id": 2402742,
        "externalRef": "External Ref",
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }],
    "tags": [{
        "id": 3203905,
        "tagId": 36614,
        "name": "tag1",
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }, {
        "id": 3203906,
        "tagId": 36700,
        "name": "tag2",
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }, {
        "id": 3203907,
        "tagId": 36701,
        "name": "tag3",
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }],
    "emailAddresses": [{
        "id": 2076493,
        "address": "testPerson@email.com",
        "location": "home",
        "isPreferred": false,
        "createdAt": "2018-09-13T06:35:09+00:00",
        "updatedAt": "2018-09-13T06:35:09+00:00"
    }],
    "linkedinUrls": [{
        "id": 1911381,
        "url": "https://www.linkedin.com/in/test-person-b33bb7169",
        "isPreferred": true,
        "createdAt": "2018-09-13T06:35:09+00:00",
        "updatedAt": "2018-09-13T06:35:09+00:00"
    }],
    "addresses": [{
        "id": 2774126,
        "street": "123 Fake Home St",
        "street2": "Apt2",
        "city": "Home City",
        "state": "NH",
        "postalCode": "03824",
        "country": "Home Country",
        "location": "home",
        "isPreferred": false,
        "regionName": null,
        "createdAt": "2018-09-20T17:50:41+00:00",
        "updatedAt": "2018-09-20T17:50:41+00:00"
    }, {
        "id": 2774127,
        "street": "234 Fake Street",
        "street2": "Work Apt",
        "city": "Work City",
        "state": "NH",
        "postalCode": "03824",
        "country": "Work Country",
        "location": "work",
        "isPreferred": false,
        "regionName": null,
        "createdAt": "2018-09-20T17:50:41+00:00",
        "updatedAt": "2018-09-20T17:50:41+00:00"
    }, {
        "id": 2774128,
        "street": "123 Other fake st",
        "street2": "123 Other Address Street",
        "city": "Other City",
        "state": "NH",
        "postalCode": "04029",
        "country": "Other Country",
        "location": "other",
        "isPreferred": false,
        "regionName": null,
        "createdAt": "2018-09-20T17:50:41+00:00",
        "updatedAt": "2018-09-20T17:50:41+00:00"
    }],
    "phoneNumbers": [{
        "id": 2373347,
        "digits": "5555555555",
        "extension": null,
        "location": "other",
        "isPreferred": true,
        "createdAt": "2018-09-20T17:50:41+00:00",
        "updatedAt": "2018-09-20T17:50:41+00:00"
    }],
    "positions": [{
        "id": 18412546,
        "title": "Position Title",
        "startMonth": 12,
        "startYear": 2009,
        "endMonth": 12,
        "endYear": 2012,
        "isCurrent": false,
        "companyAliasId": 8807124,
        "company": {
            "id": 7943136,
            "name": "Position Company",
            "aliases": [{
                "id": 8807124,
                "name": "Position Company"
            }]
        },
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }],
    "education": [{
        "id": 63,
        "degree": "JD",
        "startYear": 1996,
        "endYear": 1999,
        "school": {
            "id": 251,
            "name": "Brooklyn Law School"
        },
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }],
    "compensation": [{
        "id": 3,
        "description": "Compensation at McCorp",
        "isCurrent": false,
        "startYear": 2012,
        "endYear": 2014,
        "salary": 200000,
        "bonus": 5,
        "bonusType": "percent",
        "equity": "5.0",
        "equityType": "percent",
        "currencyCode": "USD",
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }],
    "webSites": [{
        "id": 15,
        "url": "http://www.clockworkrecruiting.com",
        "location": "work",
        "isPreferred": true,
        "createdAt": "2018-09-20T17:55:09+00:00",
        "updatedAt": "2018-09-20T17:55:09+00:00"
    }],
    "attachments": [{
        "id": 1684294,
        "attachmentType": "references",
        "fileName": "Filename",
        "fileSize": 16195,
        "contentType": "application/octet-stream",
        "url": "https://clockwork-attachments.s3-us-west-2.amazonaws.com/f170/person_references/000/001/684/294/0a5da29/VINsolutions%20Private%20App%20for%20Curaytor.docx?AWSAccessKeyId=AKIAJK7QI6GEUCKB4B4Q&Expires=1537888730&Signature=FPDywAULr7%2B29c6oEPZSOk3hprU%3D",
        "createdAt": "2018-09-24T14:52:26+00:00",
        "updatedAt": "2018-09-24T14:52:26+00:00"
    }]
}