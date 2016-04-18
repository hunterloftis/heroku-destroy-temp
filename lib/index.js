'use strict';

let cli = require('heroku-cli-util');
let co = require('co');
let cloneDeep = require('lodash.clonedeep');
let assign = require('lodash.assign');

module.exports = {
  commands: [
    {
      topic: 'apps',
      command: 'destroy-temp',
      description: 'destroy all temp apps (foo-bar-1234, you own it, no other collaborators)',
      help: 'This will also destroy all add-ons of the apps.',
      needsAuth: true,
      wantsApp: false,
      args: [],
      run: cli.command(co.wrap(destroyTemp))
    }
  ]
}

function* destroyTemp(context, heroku) {
  let deletableApps = yield cli.action('finding temp apps', co(findDeletableApps));
  if (!deletableApps.length) {
    cli.warn('No temp apps found');
    return;
  }

  listApps(deletableApps);
  let confirm = yield cli.prompt(`\nDestroy these ${ deletableApps.length } apps? (y/n)`);
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase === 'yes') {
    let coDestroyApp = co.wrap(destroyApp);
    yield cli.action('destroying apps', Promise.all(deletableApps.map(coDestroyApp)));
  }

  function* findDeletableApps() {
    let account = yield heroku.account().info();
    let apps = yield heroku.apps().list();
    let myApps = apps.filter(appOwnedBy(account));
    let tempApps = myApps.filter(appHasTempName);
    let coAppWithCollabs = co.wrap(appWithCollabs);
    let tempAppsWithCollabs = yield Promise.all(tempApps.map(coAppWithCollabs));
    let deletableApps = tempAppsWithCollabs.filter(appHasOneOwner);

    return deletableApps;
  }

  function listApps(apps) {
    let appNames = apps.map((a) => a.name);
    console.log();
    appNames.forEach((name, i) => { console.log(`${ i+1 }. ${ name }`); });
  }

  function* appWithCollabs(app) {
    let collabs = yield heroku.apps(app.name).collaborators().list();
    let collabEmails = collabs.map((c) => c.user.email);
    return assign(cloneDeep(app), { collaborators: collabEmails });
  }

  function* destroyApp(app) {
    return yield heroku.apps(app.name).delete();
  }
}

function appOwnedBy(account) {
  return (app) => app.owner.id === account.id;
}

function appHasTempName(app) {
  return app.name.match(/^[a-z]+-[a-z]+-[0-9]+$/) != null;
}

function appHasOneOwner(app) {
  return app.collaborators.length === 1;
}
