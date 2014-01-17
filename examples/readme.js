/*

readme.js - example from the README

The MIT License (MIT)

Copyright (c) 2014 Tristan Slominski

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

var ansible = require('../index.js');
var crypto = require('crypto');
var Discover = require('discover');
var DiscoverTcpTransport = require('discover-tcp-transport');
var httpTransport = require('tart-transport-http');
var tart = require('tart');
var udpTransport = require('tart-transport-udp');

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

// register Tart transports

var httpSend1 = sponsor(httpTransport.sendBeh);
var httpSend2 = sponsor(httpTransport.sendBeh);
var httpSend3 = sponsor(httpTransport.sendBeh);
var httpSend4 = sponsor(httpTransport.sendBeh);
var httpSend5 = sponsor(httpTransport.sendBeh);

var udpSend1 = sponsor(udpTransport.sendBeh);
var udpSend2 = sponsor(udpTransport.sendBeh);
var udpSend3 = sponsor(udpTransport.sendBeh);
var udpSend4 = sponsor(udpTransport.sendBeh);
var udpSend5 = sponsor(udpTransport.sendBeh);

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

ansibleCaps1.registerTransport({
    scheme: 'udp', 
    send: udpSend1,
    data: 'udp://localhost:9081'
});
ansibleCaps2.registerTransport({
    scheme: 'udp', 
    send: udpSend2,
    data: 'udp://localhost:9082'
});
ansibleCaps3.registerTransport({
    scheme: 'udp', 
    send: udpSend3,
    data: 'udp://localhost:9083'
});
ansibleCaps4.registerTransport({
    scheme: 'udp', 
    send: udpSend4,
    data: 'udp://localhost:9084'
});
ansibleCaps5.registerTransport({
    scheme: 'udp', 
    send: udpSend5,
    data: 'udp://localhost:9085'
});

// create HTTP transports and direct them to the ansible receptionists

var ansibleReceptionist1 = sponsor(ansibleCaps1.receptionistBeh);
var ansibleReceptionist2 = sponsor(ansibleCaps2.receptionistBeh);
var ansibleReceptionist3 = sponsor(ansibleCaps3.receptionistBeh);
var ansibleReceptionist4 = sponsor(ansibleCaps4.receptionistBeh);
var ansibleReceptionist5 = sponsor(ansibleCaps5.receptionistBeh);

var httpCaps1 = httpTransport.server(ansibleReceptionist1);
var httpCaps2 = httpTransport.server(ansibleReceptionist2);
var httpCaps3 = httpTransport.server(ansibleReceptionist3);
var httpCaps4 = httpTransport.server(ansibleReceptionist4);
var httpCaps5 = httpTransport.server(ansibleReceptionist5);

var udpCaps1 = udpTransport.server(ansibleReceptionist1);
var udpCaps2 = udpTransport.server(ansibleReceptionist2);
var udpCaps3 = udpTransport.server(ansibleReceptionist3);
var udpCaps4 = udpTransport.server(ansibleReceptionist4);
var udpCaps5 = udpTransport.server(ansibleReceptionist5);

var listenHttp1 = sponsor(httpCaps1.listenBeh);
var listenHttp2 = sponsor(httpCaps2.listenBeh);
var listenHttp3 = sponsor(httpCaps3.listenBeh);
var listenHttp4 = sponsor(httpCaps4.listenBeh);
var listenHttp5 = sponsor(httpCaps5.listenBeh);

var listenUdp1 = sponsor(udpCaps1.listenBeh);
var listenUdp2 = sponsor(udpCaps2.listenBeh);
var listenUdp3 = sponsor(udpCaps3.listenBeh);
var listenUdp4 = sponsor(udpCaps4.listenBeh);
var listenUdp5 = sponsor(udpCaps5.listenBeh);

var turnOnTransport = function (listen, port, next) {
    return function () {
        listen({host: 'localhost', port: port, ok: next});
    }
};

console.log('turning on Tart transports');

turnOnTransport(listenHttp1, 8081,
    turnOnTransport(listenHttp2, 8082,
        turnOnTransport(listenHttp3, 8083, 
            turnOnTransport(listenHttp4, 8084, 
                turnOnTransport(listenHttp5, 8085,
                    turnOnTransport(listenUdp1, 9081,
                        turnOnTransport(listenUdp2, 9082,
                            turnOnTransport(listenUdp3, 9083,
                                turnOnTransport(listenUdp4, 9084,
                                    turnOnTransport(listenUdp5, 9085,
                                        function () {

console.log('Tart transports are ON');
console.log('');

// create domains (only need ids again)

var domainName1 = crypto.randomBytes(42).toString('base64');
var domainName2 = crypto.randomBytes(42).toString('base64');
var domainName3 = crypto.randomBytes(42).toString('base64');
var domainName4 = crypto.randomBytes(42).toString('base64');
var domainName5 = crypto.randomBytes(42).toString('base64');

// create domain receptionists

var domainReceptionist1 = sponsor(function (message) {
    console.log('[domain 1====] received message:');
    console.log(message);
    console.log('');
});
var domainReceptionist2 = sponsor(function (message) {
    console.log('[domain =2===] received message:');
    console.log(message);
    console.log('');
});
var domainReceptionist3 = sponsor(function (message) {
    console.log('[domain ==3==] received message:');
    console.log(message);
    console.log('');
});
var domainReceptionist4 = sponsor(function (message) {
    console.log('[domain ===4=] received message:');
    console.log(message);
    console.log('');
});
var domainReceptionist5 = sponsor(function (message) {
    console.log('[domain ====5] received message:');
    console.log(message);
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
    var origin = ansibleSends[Math.floor(Math.random() * ansibleSends.length)];
    var destDomain = domains[Math.floor(Math.random() * domains.length)];

    console.log(origin.ansible, 'sending: "foo" to', destDomain.log);

    origin.send({
        address: 'ansible://' + destDomain.domain + '/#' + crypto.randomBytes(42).toString('base64'),
        content: JSON.stringify("foo"),
        fail: function (error) { console.dir(error); }
    });

    setTimeout(doRandomSend, Math.floor(Math.random() * 5000));
};

doRandomSend();

}))))))))))(); // turnOnTransport

})))))(); // turnOn
