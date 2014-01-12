# tart-ansible

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/tart-ansible.png)](http://npmjs.org/package/tart-ansible)

Ansible enables remote message delivery for [Tart](https://github.com/organix/tartjs) actors.

## Contributors

[@dalnefre](https://github.com/dalnefre), [@tristanls](https://github.com/tristanls)

## Overview

Ansible enables remote message delivery for [Tart](https://github.com/organix/tartjs) actors.

  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
  * [Sources](#sources)

### Ansible Scheme

URIs used by Ansible are represented in absolute form. The "ansible" scheme is used to locate capabilities via the Ansible protocol. The scheme-specific syntax and semantics of ansible URIs are as follows:

```
ansible_URI = "ansible:" "//" authority "/#" capability
```

The semantics are such that the identified `authority` is the domain containing the specified `capability`.

When comparing two URIs to decide whether they match or not, comparison must be case-sensitive octet-by-octet comparison with the exception of the scheme, which must be case-insensitive.

## Usage

To run the below example run:

    npm run readme

To exit `^C`.

```javascript
"use strict";

var ansible = require('../index.js');
var crypto = require('crypto');
var Discover = require('discover');
var DiscoverTcpTransport = require('discover-tcp-transport');
var httpTransport = require('tart-transport-http');
var tart = require('tart');

var sponsor = tart.minimal();

// This example will demonstrate "magically deliver any message to anywhere". 
// This sort of power takes some setup. The setup is straighforward, but there 
// is quite a bit of it. A lot of redundancy here is due to running multiple
// servers locally to demonstrate the functionality, all from one script. So,
// please, be patient :)

// create discover TCP transports

var discoverTcpTransport1 = new DiscoverTcpTransport({port: 6741});
var discoverTcpTransport2 = new DiscoverTcpTransport({port: 6742});
var discoverTcpTransport3 = new DiscoverTcpTransport({port: 6743});
var discoverTcpTransport4 = new DiscoverTcpTransport({port: 6744});
var discoverTcpTransport5 = new DiscoverTcpTransport({port: 6745});

// create discover-only initial seed domain names
// for internal discover mechanisms, only domain names are needed

var discoverDomain1 = crypto.randomBytes(42).toString('base64');
var discoverDomain2 = crypto.randomBytes(42).toString('base64');
var discoverDomain3 = crypto.randomBytes(42).toString('base64');
var discoverDomain4 = crypto.randomBytes(42).toString('base64');
var discoverDomain5 = crypto.randomBytes(42).toString('base64');

// create discover node contacts

var discoverNode1 = {id: discoverDomain1, transport: {host: 'localhost', port: 6741}};
var discoverNode2 = {id: discoverDomain2, transport: {host: 'localhost', port: 6742}};
var discoverNode3 = {id: discoverDomain3, transport: {host: 'localhost', port: 6743}};
var discoverNode4 = {id: discoverDomain4, transport: {host: 'localhost', port: 6744}};
var discoverNode5 = {id: discoverDomain5, transport: {host: 'localhost', port: 6745}};

// assign seed nodes

var seeds = [discoverNode1, discoverNode2, discoverNode3];

// create discover instances

var discover1 = new Discover({inlineTrace: false, seeds: seeds, transport: discoverTcpTransport1});
var discover2 = new Discover({inlineTrace: false, seeds: seeds, transport: discoverTcpTransport2});
var discover3 = new Discover({inlineTrace: false, seeds: seeds, transport: discoverTcpTransport3});
var discover4 = new Discover({inlineTrace: false, seeds: seeds, transport: discoverTcpTransport4});
var discover5 = new Discover({inlineTrace: false, seeds: seeds, transport: discoverTcpTransport5});

// turn on discover TCP transports

var turnOn = function (transport, next) {
    return function () {
        transport.listen(next);
    };
};

console.log('turning on Discover TCP transports');

turnOn(discoverTcpTransport1,
    turnOn(discoverTcpTransport2,
        turnOn(discoverTcpTransport3,
            turnOn(discoverTcpTransport4,
                turnOn(discoverTcpTransport5,
                    function () {

console.log('Discover TCP transports are ON');

// bootstrap discover instances with self awareness

discover1.register(discoverNode1);
discover2.register(discoverNode2);
discover3.register(discoverNode3);
discover4.register(discoverNode4);
discover5.register(discoverNode5);

// create ansible node capabilities

var ansibleCaps1 = ansible.capabilities(discover1);
var ansibleCaps2 = ansible.capabilities(discover2);
var ansibleCaps3 = ansible.capabilities(discover3);
var ansibleCaps4 = ansible.capabilities(discover4);
var ansibleCaps5 = ansible.capabilities(discover5);

// create ansible send actors

var ansibleSend1 = sponsor(ansibleCaps1.sendBeh);
var ansibleSend2 = sponsor(ansibleCaps2.sendBeh);
var ansibleSend3 = sponsor(ansibleCaps3.sendBeh);
var ansibleSend4 = sponsor(ansibleCaps4.sendBeh);
var ansibleSend5 = sponsor(ansibleCaps5.sendBeh);

// register HTTP Tart transports

var httpSend1 = sponsor(httpTransport.sendBeh);
var httpSend2 = sponsor(httpTransport.sendBeh);
var httpSend3 = sponsor(httpTransport.sendBeh);
var httpSend4 = sponsor(httpTransport.sendBeh);
var httpSend5 = sponsor(httpTransport.sendBeh);

ansibleCaps1.registerTransport({
    scheme: 'http', 
    send: httpSend1,
    data: 'http://localhost:8081'
});
ansibleCaps2.registerTransport({
    scheme: 'http', 
    send: httpSend2,
    data: 'http://localhost:8082'
});
ansibleCaps3.registerTransport({
    scheme: 'http', 
    send: httpSend3,
    data: 'http://localhost:8083'
});
ansibleCaps4.registerTransport({
    scheme: 'http', 
    send: httpSend4,
    data: 'http://localhost:8084'
});
ansibleCaps5.registerTransport({
    scheme: 'http', 
    send: httpSend5,
    data: 'http://localhost:8085'
});

// create HTTP transports and direct them to the ansible receptionists

var httpCaps1 = httpTransport.server(sponsor(ansibleCaps1.receptionistBeh));
var httpCaps2 = httpTransport.server(sponsor(ansibleCaps2.receptionistBeh));
var httpCaps3 = httpTransport.server(sponsor(ansibleCaps3.receptionistBeh));
var httpCaps4 = httpTransport.server(sponsor(ansibleCaps4.receptionistBeh));
var httpCaps5 = httpTransport.server(sponsor(ansibleCaps5.receptionistBeh));

var closeHttp1 = sponsor(httpCaps1.closeBeh);
var listenHttp1 = sponsor(httpCaps1.listenBeh);
var closeHttp2 = sponsor(httpCaps2.closeBeh);
var listenHttp2 = sponsor(httpCaps2.listenBeh);
var closeHttp3 = sponsor(httpCaps3.closeBeh);
var listenHttp3 = sponsor(httpCaps3.listenBeh);
var closeHttp4 = sponsor(httpCaps4.closeBeh);
var listenHttp4 = sponsor(httpCaps4.listenBeh);
var closeHttp5 = sponsor(httpCaps5.closeBeh);
var listenHttp5 = sponsor(httpCaps5.listenBeh);

var turnOnHttp = function (listen, port, next) {
    return function () {
        listen({host: 'localhost', port: port, ok: next});
    }
};

console.log('turning on Tart HTTP transports');

turnOnHttp(listenHttp1, 8081,
    turnOnHttp(listenHttp2, 8082,
        turnOnHttp(listenHttp3, 8083, 
            turnOnHttp(listenHttp4, 8084, 
                turnOnHttp(listenHttp5, 8085,
                    function () {

console.log('Tart HTTP transports are ON');

// create domains (only need ids again)

var domainName1 = crypto.randomBytes(42).toString('base64');
var domainName2 = crypto.randomBytes(42).toString('base64');
var domainName3 = crypto.randomBytes(42).toString('base64');
var domainName4 = crypto.randomBytes(42).toString('base64');
var domainName5 = crypto.randomBytes(42).toString('base64');

// create domain receptionists

var domainReceptionist1 = sponsor(function (message) {
    console.log('[domain 1====] received message:', message);
    console.log('');
});
var domainReceptionist2 = sponsor(function (message) {
    console.log('[domain =2===] received message:', message);
    console.log('');
});
var domainReceptionist3 = sponsor(function (message) {
    console.log('[domain ==3==] received message:', message);
    console.log('');
});
var domainReceptionist4 = sponsor(function (message) {
    console.log('[domain ===4=] received message:', message);
    console.log('');
});
var domainReceptionist5 = sponsor(function (message) {
    console.log('[domain ====5] received message:', message);
    console.log('');
});

// register domains with ansible

ansibleCaps1.registerDomain(domainName1, domainReceptionist1);
ansibleCaps2.registerDomain(domainName2, domainReceptionist2);
ansibleCaps3.registerDomain(domainName3, domainReceptionist3);
ansibleCaps4.registerDomain(domainName4, domainReceptionist4);
ansibleCaps5.registerDomain(domainName5, domainReceptionist5);

// randomly issue ansible protocol sends locally to each ansible
var ansibleSends = [
    {send: ansibleSend1, ansible: '[ansible 1====]'}, 
    {send: ansibleSend2, ansible: '[ansible =2===]'}, 
    {send: ansibleSend3, ansible: '[ansible ==3==]'},
    {send: ansibleSend4, ansible: '[ansible ===4=]'},
    {send: ansibleSend5, ansible: '[ansible ====5]'}
];
var domains = [
    {log: '[domain 1====]', domain: domainName1},
    {log: '[domain =2===]', domain: domainName2},
    {log: '[domain ==3==]', domain: domainName3},
    {log: '[domain ===4=]', domain: domainName4},
    {log: '[domain ====5]', domain: domainName5}
];

var doRandomSend = function doRandomSend () {
    var originAnsibleSend = ansibleSends[Math.floor(Math.random() * ansibleSends.length)];
    var destDomain = domains[Math.floor(Math.random() * domains.length)];

    console.log(originAnsibleSend.ansible, 'sending: "foo" to', destDomain.log);

    originAnsibleSend.send({
        address: 'ansible://' + destDomain.domain + '/#' + crypto.randomBytes(42).toString('base64'),
        content: '"foo"',
        fail: function (error) { console.dir(error); }
    });
    
    setTimeout(doRandomSend, Math.floor(Math.random() * 5000));
};

doRandomSend();

})))))(); // turnOnHttp

})))))(); // turnOn

```

## Tests

TODO

## Documentation

**Public API**

  * [ansible.capabilities(discover)](#ansiblecapabilitiesdiscover)
  * [ansibleCapabilities.receptionistBeh](#ansiblecapabilitiesreceptionistbeh)
  * [ansibleCapabilities.registerDomain(domainName, receptionist)](#ansiblecapabilitiesregisterdomaindomainname-receptionist)
  * [ansibleCapabilities.registerTransport(transportInfo)](#ansibleCapabilitiesregistertransporttransportinfo)
  * [ansibleCapabilities.sendBeh](#ansiblecapabilitiessendbeh)

### ansible.capabilities(discover)

TODO

### ansibleCapabilities.receptionistBeh

TODO

### ansibleCapabilities.registerDomain(domainName, receptionist)

TODO

### ansibleCapabilities.registerTransport(transportInfo)

TODO

### ansibleCapabilities.sendBeh

TODO

## Sources

  * [Tiny Actor Run-Time (JavaScript)](https://github.com/organix/tartjs)
