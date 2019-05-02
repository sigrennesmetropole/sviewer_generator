// definition du fond de plan pour la carte servant à determiner l'emprise
var layer_pvci = L.tileLayer('https://public.sig.rennesmetropole.fr/geowebcache/service/tms/1.0.0/ref_fonds%3Apvci@EPSG%3A3857@png/{z}/{x}/{y}.png', {
    attribution: 'Plan de ville communal et intercommunal, Référentiel voies et adresses : Rennes Métropole',
    id: 1,
    center: [48.1, -1.67],
    minZoom: 0,
    maxZoom: 20,
    tms: true,
});

//initialisation de la carte servant à determiner l'emprise
var map = L.map('carte_emprise', {
    center: [48.1, -1.67],
    zoom: 10,
    layers: [layer_pvci]
});

var geojsonLayerMap;

var fond_plan_defaut_selectionne;
var nom_commune_selectionne;
var theme_site_orgs_selectionnes;
var equipements_techniques_selectionnes;
var configueration_sviewer_selectionne = $('input[name=configuration_sviewer]:checked').val();
var titre_carte = $('#titre_sviewer').val();
var largeur_iframe = $('#largeur_iframe').val();
var hauteur_iframe = $('#hauteur_iframe').val();
var map_centre_lat = map.getCenter().lat;
var map_centre_lng = map.getCenter().lng;
var map_zoom = map.getZoom();

var data_sites_orgs;
var data_donnees_metiers;


/**
* Creer l'url permettant d'afficher le sviewer à partir des variables contenant les informations issues du formulaire
* @Return url 	url crée
*/
function generer_url_sviewer() {
	var theme_site_orgs_selectionnes_length;
	var equipements_techniques_selectionnes_length;

	var url = base_url_sviewer + '?x=' + map_centre_lng + '&y=' + map_centre_lat 
				+ '&z=' + map_zoom + '&lb=' + fond_plan_defaut_selectionne;
	if (titre_carte != '') {
		url += '&title=' + encodeURIComponent(titre_carte);
	}
	if (typeof theme_site_orgs_selectionnes !== 'undefined') {
		theme_site_orgs_selectionnes_length = theme_site_orgs_selectionnes.length;
	} else {
		theme_site_orgs_selectionnes_length = -1;
	}
	if (typeof equipements_techniques_selectionnes !== 'undefined') {
		equipements_techniques_selectionnes_length = equipements_techniques_selectionnes.length;
	} else {
		equipements_techniques_selectionnes_length = -1;
	}
	var url_layers = '';

	// gestion des couches à afficher
	if (theme_site_orgs_selectionnes_length > 0) {
		url += '&layers=';
		url_layers = theme_site_orgs_selectionnes[0];
		for (var i = 1; i < theme_site_orgs_selectionnes_length - 1; i++) {
			url_layers += ',' + theme_site_orgs_selectionnes[i];
		}
		if (equipements_techniques_selectionnes_length > 0) {
			for (var j = 0; j < equipements_techniques_selectionnes_length - 1; j++) {
				url_layers += ',' + equipements_techniques_selectionnes[j];
			}
		}
		url += encodeURIComponent(url_layers);
	} else if (equipements_techniques_selectionnes_length > 0) {
		url += '&layers=';
		url_layers = equipements_techniques_selectionnes[0];
		for (var k = 1; k < equipements_techniques_selectionnes_length - 1; k++) {
			url_layers += ',' + equipements_techniques_selectionnes[k];
		}
		url += encodeURIComponent(url_layers);
	}

	// affichage du sviewer light
	if (configueration_sviewer_selectionne == 'allegee') {
		url += "&c=light";
	}

	return url;
}

// récuperation de la commune choisi lors de la selection dans la liste déroulante 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('#liste_communes').on('select2:select', function (e) {
	// colorie sur la carte la commune qui a été séléctionnée dans le champ "commune"
	var data = e.params.data;
	if ((data.id != "") && (data.id != 1)) {
		$.get(base_url_cadastre + 'epsg:4326/commune/'+data.id, function(dataApiJson) {
			var geojsonMap = dataApiJson.coordonnees;
			afficher_coordonnees_carte(geojsonMap,  '#6a00ff');
		});
	}

    nom_commune_selectionne = $('#liste_communes').val();
    var url_sviewer = generer_url_sviewer();
   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// Recuperation de la liste des communes de Rennes Metropole à partir de l'api cadastre
// puis affichage des communes dans une liste déroulante
// Récuperation dans la variable nom_commune_selectionn, le nom de la commune choisi 
$.getJSON(base_url_cadastre + 'communes', function(liste_communes) {
	var data_communes = $.map(liste_communes, function (commune) {
    	return { text: commune.name, id: commune.idComm }
	});

	afficher_select2('liste_communes', data_communes, 'choix de la commune', true, false);
	$('#liste_communes').val('350001').trigger('change');
	nom_commune_selectionne = $('#liste_communes').val();
    var url_sviewer = generer_url_sviewer();
   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// Les donnees de la base site et organisme sont réparties en plusieurs thèmes
// Recuperation de la liste des differents themes à partir d'un fichier json
// puis affichage des themes dans une liste déroulante
// Récuperation dans la variable theme_site_orgs_selectionnes, les themes choisis  
$.getJSON('assets/json/donnees_sites_orgs.json', function(donnees_sites_orgs) {
	data_sites_orgs = $.map(donnees_sites_orgs.sites_organismes, function (donnees) {
    	return { text: donnees.text, id: donnees.couche }
	});

	afficher_select2('liste_site_org', data_sites_orgs, 'themes sites & organismes', false, true);
	theme_site_orgs_selectionnes = $('#liste_site_org').val();
    var url_sviewer = generer_url_sviewer();
   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// Recuperation de la liste des differents fonds de plan disponibles à partir d'un fichier json
// puis affichage dans une liste déroulante
// Récuperation dans la variable fond_plan_defaut_selectionne, le fond de plan choisi
$.getJSON('assets/json/fonds_plans.json', function(fonds_plans) {
	var data_fonds_plans = $.map(fonds_plans.fonds_plans, function (donnees) {
    	return { text: donnees.text, id: donnees.id }
	});

	afficher_select2('liste_fonds_plans', data_fonds_plans, 'choix du fond de plan par defaut', true, false);
	$('#liste_fonds_plans').val('0').trigger('change');
	fond_plan_defaut_selectionne = $('#liste_fonds_plans').val();
    var url_sviewer = generer_url_sviewer();
   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// Données utilies ne provenant pas de la base site et organisme
// Recuperation des types de données à partir d'un fichier json puis affichage dans une liste déroulante
// Récuperation dans la variable equipements_techniques_selectionnes, les types de données choisis
$.getJSON('assets/json/donnees_metiers.json', function(donnees_metiers) {
	data_donnees_metiers = $.map(donnees_metiers.donnees_metiers, function (donnees) {
    	return { text: donnees.nom, id: donnees.couche }
	});

	afficher_select2('liste_equipements_techniques', data_donnees_metiers, 'donnees metiers', false, true);
	equipements_techniques_selectionnes = $('#liste_equipements_techniques').val();
    var url_sviewer = generer_url_sviewer();
   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

$("#liste_site_org_cb").change(function() {
    if(this.checked) {
    	data_sites_orgs.forEach(function(data) {
    		theme_site_orgs_selectionnes.push(data.id);
    	});
    	$('#liste_site_org').val(theme_site_orgs_selectionnes).trigger('change');
    	var url_sviewer = generer_url_sviewer();
   		afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
    }
});

$("#liste_equipements_techniques_cb").change(function() {
    if(this.checked) {
   		data_donnees_metiers.forEach(function(data) {
   			equipements_techniques_selectionnes.push(data.id);
    	});
    }
    $('#liste_equipements_techniques').val(equipements_techniques_selectionnes).trigger('change');
    	var url_sviewer = generer_url_sviewer();
   		afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

/** 
* Affiche la commune choisi sur la carte de selection de l'emprise
* @Param coordonnees		coordonnes de la commune
* @Param couleur			couleur d'affichage de la commune
*/
function afficher_coordonnees_carte(coordonnees, couleur) {
	var mapStyle = {
				'color': couleur,
				'weight': 3,
				'opacity': 1
			};
   if(geojsonLayerMap != null) {
		map.removeLayer(geojsonLayerMap);
	}
	if (coordonnees != '') {
		geojsonLayerMap = L.geoJSON(coordonnees, {'style': mapStyle}).addTo(map);
		map.fitBounds(geojsonLayerMap.getBounds());
	}
}


// récuperation du fond de lan choisi lors de la selection dans la liste déroulante 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('#liste_fonds_plans').on('select2:select', function (e) {
    fond_plan_defaut_selectionne = $('#liste_fonds_plans').val();
    var url_sviewer = generer_url_sviewer();
    afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
   });

// récuperation de la liste des thèmes choisi lors de la selection dans la liste déroulante
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('#liste_site_org').on('select2:select', function (e) {
    theme_site_orgs_selectionnes = $('#liste_site_org').val();
    console.log(theme_site_orgs_selectionnes);
    var url_sviewer = generer_url_sviewer();
    afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// modification de la variable contenant les themes choisis lorsqu'un element est retiré de la séléction
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$("#liste_site_org").on("select2:unselecting", function(e) {
	var id_couche_retiree = e.params.args.data.id;
	var pos = theme_site_orgs_selectionnes.indexOf(id_couche_retiree);
	var removedItem = theme_site_orgs_selectionnes.splice(pos, 1);
	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
	$('#liste_site_org_cb').prop('checked', false);
 });

// récuperation de la liste des données metiers choisis lors de la selection dans la liste déroulante 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('#liste_equipements_techniques').on('select2:select', function (e) {
    equipements_techniques_selectionnes = $('#liste_equipements_techniques').val();
    var url_sviewer = generer_url_sviewer();
    afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// modification de la variable contenant les données metiers choisis lorsqu'un element est retiré de la séléction
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$("#liste_equipements_techniques").on("select2:unselecting", function(e) {
	var id_couche_retiree = e.params.args.data.id;
	var pos = equipements_techniques_selectionnes.indexOf(id_couche_retiree);
	var removedItem = equipements_techniques_selectionnes.splice(pos, 1);
	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
	$('#liste_equipements_techniques_cb').prop('checked', false);
 });

// récuperation de la configuration du sviewer choisie lorsque un des boutons radio est séléctionné 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('input[name=configuration_sviewer]').change(function() {
	configueration_sviewer_selectionne = $('input[name=configuration_sviewer]:checked').val();
	var url_sviewer = generer_url_sviewer();
    afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

//  récupération du titre du sviewer à chaque modification 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
 $('#titre_sviewer').on('input', function() {
 	titre_carte = $('#titre_sviewer').val();
 	var url_sviewer = generer_url_sviewer();
    afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

// récupération de la largeur de l'iframe à chaque modification 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
 $('#largeur_iframe').on('input', function() {
 	largeur_iframe = $('#largeur_iframe').val();
 	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

// récupération de la hauteur de l'iframe à chaque modification 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
 $('#hauteur_iframe').on('input', function() {
 	hauteur_iframe = $('#hauteur_iframe').val();
 	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

// récupération des coordonnées du centre de la carte et du niveau de zoom à chaque zoom sur la carte d'emprise
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
map.on('zoomend', function() {
	map_centre_lat = map.getCenter().lat;
	map_centre_lng = map.getCenter().lng;
	map_zoom = map.getZoom();
	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});

// récupération des coordonnées du centre de la carte et du niveau de zoom à chaque déplacement sur la carte d'emprise
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
map.on('mouseup', function() {
	map_centre_lat = map.getCenter().lat;
	map_centre_lng = map.getCenter().lng;
	map_zoom = map.getZoom();
	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});