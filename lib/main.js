"use strict";


exports.main = function(options, callbacks) {

  const self = require('sdk/self');
  const pagemod = require('sdk/page-mod');

  console.debug('main', options);
  pagemod.PageMod({
    include: '*',
    contentScriptWhen: 'start',
    contentScriptFile: [
      self.data.url('contentscript.js')
    ],
    contentScriptOptions: {
      actionsForModifierCombination: {
        'S---': 'copy-link-location',
        'SC--': 'save-link-location'
      }
    },
    onAttach: function(worker) {
      console.debug('addon: got attached');
      worker.port.on('copy-link-location', function(href) {
        console.log('addon: copy link location', href);
        const clipboard = require('sdk/clipboard');
        clipboard.set(href, 'text');
      });
      worker.port.on('save-link-location', function(href) {
        console.log('addon: save link location', href);
      });
    }
  });
};


exports.onUnload = function(reason) {
  console.debug('onUnload', reason);
};
