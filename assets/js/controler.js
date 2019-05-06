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
    zoom: 12,
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
var nom_label_url;
var nom_label_code;
var url_api_cadastre;
var url_sviewer;


/**
* Creer l'url permettant d'afficher le sviewer à partir des variables contenant les informations issues du formulaire
* @Return url 	url crée
*/
function generer_url_sviewer() {
	var theme_site_orgs_selectionnes_length;
	var equipements_techniques_selectionnes_length;

	var url = url_sviewer + '?x=' + map_centre_lng + '&y=' + map_centre_lat 
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

/**
* crée un champ select2
* @Param id_liste           identifiant de la div où se trouve le select2
* @Param data               données à afficher dans le select2
* @Param placeholder        texte indicatif
* @Param close_on_select    booléen indiquant si la liste deroulante se ferme lors du choix d'un élémnent
* @Param allow_clear        booléen permettant d'ajouter la fonctionnalité de désélectionné un ou tous les champs choisis
*/
function afficher_select2(id_liste, data, placeholder, close_on_select, allow_clear) {
	$('#'+id_liste).select2({
		minimumInputLength: 0,
		width: '100%',
		language: languageFr,
		placeholder: placeholder,
		closeOnSelect: close_on_select,
		allowClear: allow_clear,
		data: data
	});
}

function a(id_text_area) {
	var url_text_area = $('#'+id_text_area).val();
	var url_text_area_split1 = url_text_area.split('?');
	console.log(url_text_area_split1);
	console.log(url_text_area);
}

/**
* ajouter dans le html, le code permettant d'afficher l'url du sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_url_sviewer(url_sviewer) {
	var contenu_html = '<div class="affichage_horizontal"> <label class="form-check-label espace_droite" for="conf_complete"> '+nom_label_url +'</label>'
					+  '<textarea id="url_carte" onchange="a(\'url_carte\')" class="form-control">' + url_sviewer + ' </textarea> </div>';
	$('#affichage_url_sviewer').html(contenu_html);
}

/**
* ajouter dans le html, le code permettant d'afficher le code source de l'iframe
* @Param largeur_iframe     largeur du cadre contenant le sviewer
* @Param hauteur_iframe     hauteur du cadre contenant le sviewer
* @Param url_sviewer   l'url du sviewer à afficher  
*/
function afficher_code_iframe(largeur_iframe, hauteur_iframe, url_sviewer) {
	var iframe = '<iframe width="'+ largeur_iframe +'" height="'+ hauteur_iframe +'" src="'+ url_sviewer +'"> </iframe>';
	var contenu_html = '<div class="affichage_horizontal"> <label class="form-check-label espace_droite" for="conf_complete"> '+ nom_label_code +'</label>'
						+ '<textarea id="code_iframe" onchange="a(\'code_iframe\')" class="form-control">' + iframe + ' </textarea> </div>';
	$('#affichage_code').html(contenu_html);
}

/**
* affichage de l'iframe contenant l'url du sviewer crée
* @Param largeur_iframe     largeur du cadre contenant le sviewer
* @Param hauteur_iframe     hauteur du cadre contenant le sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_resultat_iframe(largeur_iframe, hauteur_iframe, url_sviewer) {
	var iframe = '<iframe id="iframe_sviewer" width="'+ largeur_iframe +'" height="'+ hauteur_iframe +'" src="'+ url_sviewer +'"> </iframe>';
	$('#visualisation_resultat').html(iframe);
}


/**
* affiche l'url du sviewer, le code html de l'iframe et l'affichage du résultat
* @Param largeur_iframe     largeur du cadre contenant le sviewer
* @Param hauteur_iframe     hauteur du cadre contenant le sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe) {
	afficher_url_sviewer(url_sviewer);
    afficher_code_iframe(largeur_iframe, hauteur_iframe, url_sviewer);
    afficher_resultat_iframe(largeur_iframe, hauteur_iframe, url_sviewer);
}

var languageFr = {
    inputTooShort: function (args) {
        return 'Saisissez au moins ' + args.minimum + ' caractères';
    },
    errorLoading: function () {
        return 'Les résultats ne peuvent pas être chargés.';
    },
    inputTooLong: function (args) {
        return 'Vous pouvez entrer seulement ' + args.maximum + ' caractères';
    },
    noResults: function () {
        return 'Aucun résultat trouvé';
    },
    searching: function () {
        return 'Recherche en cours…';
    },
    maximumSelected: function (args) {
        return 'Vous pouvez seulement sélectionner ' + args.maximum +
          ' élément' + (args.maximum > 1) ? 's' : '';
    }
};


// récuperation de la commune choisi lors de la selection dans la liste déroulante 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('#liste_communes').on('select2:select', function (e) {
	// colorie sur la carte la commune qui a été séléctionnée dans le champ "commune"
	var data = e.params.data;
	if ((data.id != "") && (data.id != 1)) {
		$.get(url_api_cadastre + 'epsg:4326/commune/'+data.id, function(dataApiJson) {
			var geojsonMap = dataApiJson.coordonnees;
			afficher_coordonnees_carte(geojsonMap,  '#6a00ff');
		});
	}

    nom_commune_selectionne = $('#liste_communes').val();
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

   		console.log(document.getElementById("iframe_sviewer").src);
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


// récuperation du fond de plan choisi lors de la selection dans la liste déroulante 
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

 $('input[type=textarea]').bind('input propertychange', function() {
 	console.log(this.value);
 });

  $('#url_carte').change(function() {
 	alert('change');
 });

  $('#url_carte').on('input', function() {
  	alert('change');
 });

  $('#url_carte').on('change', function() {
  	alert('change');
 });

$.when(get_configuration_data()).done(function(configuration) {
    $('#nom_application').html(configuration.nom_application);
    $('#titre_page').html(configuration.titre_application);
    $('#detail_text').html(configuration.detail_text);
    $('#partie_configuration_carte').prepend(configuration.partie_configuration_carte[0].nom_partie_configuration_carte + ' ');
    $('#titre_partie_cadrage').html(configuration.partie_configuration_carte[0].nom_choix_cadrage);
    $('#titre_choix_donnees').html(configuration.partie_configuration_carte[0].nom_choix_donnees);
    $('#label_fond_plan').html(configuration.partie_configuration_carte[0].nom_label_fond_plan);
    $('#label_sites_orgs').html(configuration.partie_configuration_carte[0].nom_label_sites_orgs);
    $('#label_donnees_metiers').html(configuration.partie_configuration_carte[0].nom_label_donnees_metires);
    $('#titre_choix_interface').html(configuration.partie_configuration_carte[0].nom_choix_interface);
    $('#label_configuration_complete').append(configuration.partie_configuration_carte[0].nom_interface_complete);
    $('#label_configuration_allegee').append(configuration.partie_configuration_carte[0].nom_interface_allegee);
    $('#titre_titre_carte').html(configuration.partie_configuration_carte[0].nom_choix_titre_carte);
    $('#titre_taille_carte').html(configuration.partie_configuration_carte[0].nom_choix_taille_carte);
    $('#titre_apercu_carte').prepend(configuration.partie_apercu_carte[0].nom_partie_apercu_carte + ' ');
    $('#titre_partage').prepend(configuration.partie_partage[0].nom_partie_partage + ' ');
    $('#label_largeur').html(configuration.partie_configuration_carte[0].nom_label_largeur);
    $('#label_hauteur').html(configuration.partie_configuration_carte[0].nom_label_hauteur);
    $('#largeur_iframe').val(configuration.partie_configuration_carte[0].largeur_carte_par_defaut);
    $('#hauteur_iframe').val(configuration.partie_configuration_carte[0].hauteur_carte_par_defaut);
    nom_label_url = configuration.partie_partage[0].nom_champ_url;
    nom_label_code = configuration.partie_partage[0].nom_champ_code_html;
    $('#version').append( "<p> version "+ configuration.numero_version +"</p>" );
    url_api_cadastre = configuration.url_api_cadastre_Rennes_Metropole;
    url_sviewer = configuration.localisation_sviewer;

    $('#largeur_iframe').attr('max', configuration.partie_configuration_carte[0].largeur_max_carte);
	$('#hauteur_iframe').attr('max', configuration.partie_configuration_carte[0].hauteur_max_carte);

    largeur_iframe = $('#largeur_iframe').val();
	hauteur_iframe = $('#hauteur_iframe').val();

	map.setZoom(configuration.partie_configuration_carte[0].zoom_carte_par_defaut);
	$('#titre_sviewer').val(configuration.partie_configuration_carte[0].titre_carte_par_defaut);
	titre_carte = $('#titre_sviewer').val();

    $.when(get_liste_communes(url_api_cadastre)).done(function(liste_communes) {
		var data_communes = $.map(liste_communes, function (commune) {
	    	return { text: commune.name, id: commune.idComm }
		});
		afficher_select2('liste_communes', data_communes, 'choix de la commune', true, false);
		//$('#liste_communes').val('350001').trigger('change');
		//nom_commune_selectionne = $('#liste_communes').val();
	    var url_sviewer = generer_url_sviewer();
	   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
	});
});


// Les donnees de la base site et organisme sont réparties en plusieurs thèmes
// Recuperation de la liste des differents themes à partir d'un fichier json
// puis affichage des themes dans une liste déroulante
// Récuperation dans la variable theme_site_orgs_selectionnes, les themes choisis  
$.when(get_donnees_sites_orgs()).done(function(donnees_sites_orgs) {
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
$.when(get_fonds_plan()).done(function(fonds_plan) {
	var data_fonds_plans = $.map(fonds_plan.fonds_plans, function (donnees) {
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
$.when(get_donnees_metiers()).done(function(donnees_metiers) {
	data_donnees_metiers = $.map(donnees_metiers.donnees_metiers, function (donnees) {
    	return { text: donnees.nom, id: donnees.couche }
	});

	afficher_select2('liste_equipements_techniques', data_donnees_metiers, 'donnees metiers', false, true);
	equipements_techniques_selectionnes = $('#liste_equipements_techniques').val();
    var url_sviewer = generer_url_sviewer();
   	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});
