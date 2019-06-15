# sviewer_generator - generating simple viewers for geOrchestra
===============================================================

This tool helps public users to configure and generate  simple viewers of OGC WMS services with an easy interface.
It uses geOrchestra sviewer (https://github.com/georchestra/sviewer) forked by Rennes Métropole (https://github.com/sigrennesmetropole/sviewer) to uses it's own addresses API  (https://api-rva.sig.rennesmetropole.fr/accueil.php).

Note :  Rennes Métropole addresses API covers only Rennes Métropole's extend.

An overview of the viewer is automatically updated at every change.

An http link and an iframe are automatically created and can be copied to the clipboard for it's paste in a website.

The user can configure : title, extent and zoom , interface type, base layers, point of interest WMS layers ,thematic WMS layers, iframe's height and width.
A link to an iframe reducer is proposed.

A contextual help exists for each item.

The administrator can adapted the tool for use it's own sviewer and IDG.

Requirements
---------------
* sviewer installed and configured  on a geOrchestra instance (https://github.com/georchestra/sviewer) with 
   * operationnal  base layers,
   * two differents configuration of the sviewer
* WMS layers with html templates to use 


Configuring
----------------

* title : free text
* extent : choice in geojson file https://github.com/sigrennesmetropole/sviewer_generator/blob/master/assets/json/3857_Coordonnees_centre_bourg.geojson
* interface : 2 differents configuration files of sviewer
* base layers configured in sviewer listed in https://github.com/sigrennesmetropole/sviewer_generator/blob/master/assets/json/fonds_plans.json
* point of interest layers listed in https://github.com/sigrennesmetropole/sviewer_generator/blob/master/assets/json/donnees_sites_orgs.json
* thematic's layers listed in https://github.com/sigrennesmetropole/sviewer_generator/blob/master/assets/json/donnees_metiers.json

* contextual help and sviewer_generator can be modified in https://github.com/sigrennesmetropole/sviewer_generator/blob/master/assets/json/configuration.json

