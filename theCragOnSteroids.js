// ==UserScript==
// @name         theCrag on steroids
// @namespace    http://tampermonkey.net/
// @version      0.2.5
// @description  Some userspace impovements to make theCrag even better!
// @author       Thomas Heuberger
// @match        https://www.thecrag.com/*/routes*
// @icon         https://static.thecrag.com/cids/images/logo17-1.1.1.svg
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const HEADERIDENTIFIER = 'tbody > tr:nth-child(1) > th:nth-child(4)';
  const NAMEROWIDENTIFIER = 'crumbtrail-partial__crumb nowrap';
  const ROUTETABLEIDENTIFIER = 'routetable facet-results';

  const STYLE = 'display: inline; float: right;';

  function getInfo(selector) {
    return {
      sector: selector.length > 0 ? selector[0].querySelector('a').text : '',
      crag: selector.length > 1 ? selector[1].querySelector('a').text : '',
    };
  }

  const routesTable = document.getElementsByClassName(ROUTETABLEIDENTIFIER)[0];
  const cragsByGroup = routesTable.getElementsByClassName('group');
  const header = routesTable.querySelector(HEADERIDENTIFIER);
  const routesRows = routesTable.querySelector('tbody').getElementsByTagName('tr');

  header.appendChild(document.createTextNode(
      `   (Displaying ${cragsByGroup.length} crag${cragsByGroup.length > 1 ? 's' : ''} on this page)`));

  const routesByCragMap = new Map();
  let info = {};

  Array.from(routesRows).forEach((el, index) => {
    if (index != 0 && el.innerText != '') {
      if (el.getElementsByClassName(NAMEROWIDENTIFIER).length != 0) {
        info = getInfo(el.getElementsByClassName(NAMEROWIDENTIFIER));
      } else {
        if (!routesByCragMap.has(info.sector)) {
          const thisCrag = new Map();
          thisCrag.set(info.crag, {routes: 1});
          routesByCragMap.set(info.sector, {totalRoutes: 1, Crags: thisCrag});
        } else {
          routesByCragMap.get(info.sector).totalRoutes += 1;
          if (!routesByCragMap.get(info.sector).Crags.has(info.crag)) {
            routesByCragMap.get(info.sector).Crags.set(info.crag, {routes: 1});
          } else {
            routesByCragMap.get(info.sector).Crags.get(info.crag).routes += 1;
          }
        }
      }
    }
  });

  Array.from(cragsByGroup).forEach((el) => {
    const countDiv = document.createElement('div');
    countDiv.style = STYLE;
    info = getInfo(el.getElementsByClassName(NAMEROWIDENTIFIER));
    const inSector =
      `${routesByCragMap.get(info.sector).totalRoutes} 
      route${routesByCragMap.get(info.sector).totalRoutes > 1 ? 's' : ''} in sector ${info.sector}`;
    const inCrag =
      `${routesByCragMap.get(info.sector).Crags.get(info.crag).routes} 
      route${routesByCragMap.get(info.sector).Crags.get(info.crag).routes > 1 ? 's': ''} in crag ${info.crag}`;
    countDiv.textContent = '   (';
    countDiv.textContent += info.crag != '' ? `${inSector}, ` : '';
    countDiv.textContent += `${inCrag}`;
    countDiv.textContent += 'on this page)';
    el.appendChild(countDiv);
  }, routesByCragMap);
})();
