const options = self.options;
console.debug('contentscript: loaded', options);
window.addEventListener("click", function(e) {
  console.debug('contentscript: document got click event');
  if (e.target instanceof Element) {
    for (let elem = e.target;
         elem != null;
         elem = elem.parentElement) {
      if (elem instanceof HTMLAnchorElement) {
        console.debug('contentscript: AnchorElement');
        let combination = [
          e.shiftKey? 'S': '-',
          e.ctrlKey ? 'C': '-',
          e.altKey  ? 'A': '-',
          e.metaKey ? 'M': '-'
        ].join('');
        let action = options.ActionsForModifierCombination[combination];
        if (action) {
          self.port.emit(action, elem.href);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }
},
false, /* don't capture events*/
false  /* discard untrusted events, i.e. synthetic events dispatched by web content */
);
