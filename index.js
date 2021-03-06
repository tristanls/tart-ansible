/*

index.js - "tart-ansible": Tart Ansible

The MIT License (MIT)

Copyright (c) 2014 Dale Schumacher, Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var url = require('url');

var ansible = module.exports;

ansible.capabilities = function capabilities(discover) {
    var domains = {};
    var transports = {};

    var receptionistBeh = function receptionistBeh(message) {
        // find registered domain receptionist for the message
        var content = JSON.parse(message.content);
        var domain = domains[content.domain];
        if (!domain) {
            // FIXME: remove this debug logging
            console.log("***NO DOMAIN FOUND***");
            return;
        }

        var parsed = url.parse(message.address);

        if (content.hint) {
            discover.add(content.hint);
        }

        domain.receptionist({
            address: 'ansible://' + content.domain + '/' + parsed.hash,
            content: content.content
        });
    };

    var registerDomain = function registerDomain(domainName, receptionist) {
        var data = {};
        Object.keys(transports).forEach(function (scheme) {
            data[scheme] = transports[scheme].data;
        });
        var contact = {
            id: domainName,
            data: data
        };

        // discover.register() attaches transport information to the contact
        contact = discover.register(contact);

        domains[domainName] = {
            contact: contact,
            receptionist: receptionist
        };
    };

    var registerTransport = function registerTransport(transportInfo) {
        transports[transportInfo.scheme] = {
            data: transportInfo.data,
            send: transportInfo.send
        };
    };

    var sendBeh = function sendBeh(message) {
        // FIXME: remove this debug logging
        var loggedMessage = {
            address: message.address,
            content: message.content,
            hint: message.hint
        };
        console.log(loggedMessage);
        console.log('');

        if (!message.address) {
            if (message.fail) {
                message.fail(new Error("Missing address"));
            }
            return;
        }

        var schemeAndRest = message.address.split('://');
        if (schemeAndRest[0].toLowerCase() !== 'ansible') {
            if (message.fail) {
                message.fail(new Error("Invalid protocol " + schemeAndRest[0]));
            }
            return;
        }

        var authorityAndCapability = schemeAndRest[1].split('/#');
        if (authorityAndCapability.length !== 2) {
            if (message.fail) {
                message.fail(new Error("Invalid URI " + message.address));
            }
            return;
        }

        var authority = authorityAndCapability[0];
        var capability = authorityAndCapability[1];

        var successfullyResolved = false;

        discover.find(authority, function (error, contact) {
            if (successfullyResolved) {
                return;
            }

            if (error) {
                // FIXME: remove this debug logging
                console.log("***ERROR SENDING***");
                console.dir(error);
                if (message.fail) {
                    message.fail(new Error("Message send failed."));
                }
                return;
            }

            successfullyResolved = true;

            // contact: {
            //   ...
            //   data: {
            //     http: <URI>,
            //     tcp: <URI>,
            //     ... 
            //   }
            //   ...
            // }
            // select available transports according to contact.data URI

            // FIXME: for now pick random transport
            var scheme = Object.keys(contact.data)[Math.floor(Math.random() * Object.keys(contact.data).length)];
            var address = contact.data[scheme];
            var transport = transports[scheme];
            if (!transport || !transport.send) {
                if (message.fail) {
                    message.fail(new Error("Unsupported transport " + scheme));
                }
                return;
            }

            console.log('[ansible]', authority, 'resolved to', address);

            var content = {
                domain: authority,
                content: message.content
            };

            // determine if we should be hinting the DHT as to where to respond
            // only hint if we have valid contact information for the domain
            // to be hinted
            var domain = domains[message.hint];
            if (domain) {
                content.hint = domain.contact;
            }

            var msg = {
                address: address + "/#" + capability,
                content: JSON.stringify(content)
            };

            console.dir(msg);
            console.log('');

            msg.fail = message.fail;
            msg.ok = message.ok;

            transport.send(msg);
        });        
    };

    var unregisterDomain = function unregisterDomain(domainName) {
        delete domains[domainName];
        discover.unregister({id: domainName});
    };

    return {
        receptionistBeh: receptionistBeh,
        registerDomain: registerDomain,
        registerTransport: registerTransport,
        sendBeh: sendBeh,
        unregisterDomain: unregisterDomain
    };
};