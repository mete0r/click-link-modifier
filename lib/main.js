"use strict";


function getPrefs() {
  const system = require('sdk/system');
  const home = system.pathFor('Home');
  const prefs = {
    ActionsForModifierCombination: {
      // S: Shift
      // C: Ctrl
      // A: Alt
      // M: Meta
      'S---': 'copy-link-location',
      'SC--': 'pass-to-external-handler'
    },
    ExternalHandler: home + '/.local/bin/save-link-location'
  };
  return prefs;
}


exports.main = function(options, callbacks) {

  const self = require('sdk/self');
  const tabs = require('sdk/tabs');
  const prefs = getPrefs();

  console.debug('main', options);
  tabs.on('ready', function(tab) {
    const worker = tab.attach({
      contentScriptFile: [
        self.data.url('contentscript.js')
      ],
      contentScriptOptions: {
        ActionsForModifierCombination: prefs.ActionsForModifierCombination
      }
    });
    for (let action in Actions) {
      worker.port.on(action, Actions[action]);
    }
  });
};


exports.onUnload = function(reason) {
  console.debug('onUnload', reason);
};


const Actions = {};


Actions['copy-link-location'] = function(href) {
  console.log('addon: copy link location', href);
  const clipboard = require('sdk/clipboard');
  clipboard.set(href, 'text');
};


Actions['pass-to-external-handler'] = function(href) {
  const prefs = getPrefs();
  const handler = prefs.ExternalHandler;
  try {
    const system = require('sdk/system');
    const home = system.pathFor('Home');
    const env = require('sdk/system/environment');
    const child_process = require('sdk/system/child_process');
    const p = child_process.spawn(handler, [href], {
      env: {
        PATH: env.PATH,
        HOME: home
      }
    });
    p.stdout.on('data', function(data) {
      console.log('p', 'stdout', data);
    });
    p.stderr.on('data', function(data) {
      console.log('p', 'stderr', data);
    });
    p.on('close', function(code) {
      console.log('child process exited with code', code);
    });
  }
  catch (e) {
    console.error(e);
  }
};
