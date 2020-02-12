/**
 * @file Ingress-ICE, everything related to plain login
 * @license MIT
 */

/*global announce */
/*global config */
/*global page */
/*global system */
/*global prepare */
/*global hideDebris */
/*global setMinMax */
/*global addIitc */
/*global twostep */
/*global loginTimeout */
/*global quit */
/*global storeCookies */
/*global main */

/**
 * Fires plain login
 */
function firePlainLogin() {
  page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36';
  page.open('https://intel.ingress.com/intel', function (status) {

    if (status !== 'success') {quit('unable to connect to remote server')}

    var link = page.evaluate(function () {
      return document.getElementsByTagName('a')[0].href;
    });

    announce('Logging in...');
    page.open(link, function () {
      login(config.login, config.password);
    });
  });
}

/**
 * Log in to google. Doesn't use post, because URI may change.
 * Fixed in 3.0.0 -- obsolete versions will not work (google changed login form)
 * @param l - google login
 * @param p - google password
 */
function login(l, p) {
  page.evaluate(function (l) {
    document.getElementById('identifierId').value = l;
  }, l);
  page.evaluate(function () {
    document.querySelector("#identifierNext").click();
  });
  window.setTimeout(function () {
    page.evaluate(function (p) {
    	document.getElementsByName('password')[0].value = p;
    }, p);
    page.evaluate(function () {
      document.querySelector("#passwordNext").click();
    });
/**
    page.evaluate(function () {
      document.getElementById('profileIdentifier').click();
    });
*/
    window.setTimeout(function () {
      window.setTimeout(afterPlainLogin, loginTimeout);
    }, loginTimeout)
  }, loginTimeout / 10);
}

/**
 * Does all stuff needed after login/password authentication
 * @since 3.1.0
 */
function afterPlainLogin() {
  page.open(config.area, function() {
    if (!isSignedIn()) {
      announce('Something went wrong. Please, sign in to Google via your browser and restart ICE. Don\'t worry, your Ingress account will not be affected.');
      quit();
    }
    window.setTimeout(function() {
      storeCookies();
      if (config.iitc) {
        addIitc();
      }
      setTimeout(function() {
        announce('Will start screenshooting in ' + config.delay/1000 + ' seconds...');
        if (((config.minlevel > 1)||(config.maxlevel < 8)) && !config.iitc) {
          setMinMax(config.minlevel, config.maxlevel);
        } else if (!config.iitc) {
          page.evaluate(function() {
            document.querySelector("#filters_container").style.display= 'none';
          });
        }
        hideDebris(config.iitc);
        prepare(config.iitc, config.width, config.height);
        announce('The first screenshot may not contain all portals, it is intended for you to check framing.');
        main();
        setInterval(main, config.delay);
      }, loginTimeout);
    }, loginTimeout/10);
  });
}
