/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
// ==UserScript==
// @name         theCrag on steroids
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Some userspace impovements to make theCrag even better!
// @author       Thomas Heuberger
// @match        https://www.thecrag.com/*/routes*
// @icon         https://static.thecrag.com/cids/images/logo17-1.1.1.svg
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const routesTable = document.getElementsByClassName('routetable facet-results')[0];
  routesTable.id = 'resultTable';
  const cragsByGroup = routesTable.getElementsByClassName('group');
  const header = routesTable.querySelector('tbody > tr:nth-child(1) > th:nth-child(4)');
  const routesRows = routesTable.querySelector('tbody').getElementsByTagName('tr');

  header.appendChild(document.createTextNode(`   (Displaying ${cragsByGroup.length} crag${cragsByGroup.length > 1 ? 's' : ''} on this page)`));

  const routesByCragMap = new Map();
  let currentSector = '';
  let currentCrag = '';

  function getCurrentCrag(selector) {
    return selector.length > 1 ? selector[1].querySelector('a').text : '';
  }

  function getCurrentSector(selector) {
    return selector[0].querySelector('a').text;
  }

  Array.from(routesRows).forEach((el, index) => {
    if (index != 0) {
      if (el.getElementsByClassName('crumbtrail-partial__crumb nowrap').length != 0) {
        const thisSelector = el.getElementsByClassName('crumbtrail-partial__crumb nowrap');
        currentSector = getCurrentSector(thisSelector);
        currentCrag = getCurrentCrag(thisSelector);
      } else {
        if (!routesByCragMap.has(currentSector)) {
          const thisCrag = new Map();
          thisCrag.set(currentCrag, {routes: 1});
          routesByCragMap.set(currentSector, {totalRoutes: 1, Crags: thisCrag});
        } else {
          routesByCragMap.get(currentSector).totalRoutes += 1;
          if (!routesByCragMap.get(currentSector).Crags.has(currentCrag)) {
            routesByCragMap.get(currentSector).Crags.set(currentCrag, {routes: 1});
          } else {
            routesByCragMap.get(currentSector).Crags.get(currentCrag).routes += 1;
          }
        }
      }
    }
  });

  Array.from(cragsByGroup).forEach((el, index) => {
    const countDiv = document.createElement('div');
    countDiv.style = 'display: inline; float: right;';
    const thisSelector = el.getElementsByClassName('crumbtrail-partial__crumb nowrap');
    currentSector = getCurrentSector(thisSelector);
    currentCrag = getCurrentCrag(thisSelector);
    const inSector = `${routesByCragMap.get(currentSector).totalRoutes} route${routesByCragMap.get(currentSector).totalRoutes > 1 ? 's' : ''} in sector ${currentSector}`;
    const inCrag = `${routesByCragMap.get(currentSector).Crags.get(currentCrag).routes} route${routesByCragMap.get(currentSector).Crags.get(currentCrag).routes > 1 ? 's': ''} in crag ${currentCrag}`;
    countDiv.textContent = currentCrag != '' ? `   (${inSector}, ` : '';
    countDiv.textContent += `${inCrag}`;
    countDiv.textContent += 'on this page)';
    el.appendChild(countDiv);
  }, routesByCragMap);
})();
