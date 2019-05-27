// definition du fond de plan pour la carte servant à determiner l'emprise
var layer_pvci = L.tileLayer('https://public.sig.rennesmetropole.fr/geowebcache/service/tms/1.0.0/ref_fonds%3Apvci@EPSG%3A3857@png/{z}/{x}/{y}.png', {
    attribution: 'Plan de ville communal et intercommunal, Référentiel voies et adresses : Rennes Métropole',
    id: 1,
    center: [48.1, -1.67],
    minZoom: 0,
    maxZoom: 20,
    tms: true,
});

var url_sviewer;


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
var configuration_sviewer_selectionne  = $('input[name=configuration_sviewer]:checked').val();
var titre_carte = $('#titre_sviewer').val();
var largeur_iframe;
var hauteur_iframe;
var hauteur_iframe_glimpse;
var largeur_iframe_glimpse; 
var map_centre_lat = map.getCenter().lat;
var map_centre_lng = map.getCenter().lng;
var map_zoom = map.getZoom();

var data_sites_orgs;
var data_donnees_metiers;
var url_api_cadastre;
var url_geoserver;

if ($('input[name=taille_iframe]:checked').val() == 'pixels') {
	largeur_iframe = $('#largeur_iframe_pixel').val();
	hauteur_iframe = $('#hauteur_iframe_pixel').val();
	$('#largeur_iframe_pixel').attr("disabled",false);
	$('#hauteur_iframe_pixel').attr("disabled",false);
	$('#largeur_iframe_pourcent').attr("disabled",true);
	$('#hauteur_iframe_pourcent').attr("disabled",true);
} else if ($('input[name=taille_iframe]:checked').val() == 'pourcentage') {
	largeur_iframe = $('#largeur_iframe_pourcent').val() + '%';
	hauteur_iframe = $('#hauteur_iframe_pourcent').val() + '%';
	$('#largeur_iframe_pixel').attr("disabled",true);
	$('#hauteur_iframe_pixel').attr("disabled",true);
	$('#largeur_iframe_pourcent').attr("disabled",false);
	$('#hauteur_iframe_pourcent').attr("disabled",false);
}

/**
 * 
 * @returns
 */
function check_equipements_techniques_selectionnes() {
	if (typeof equipements_techniques_selectionnes !== 'undefined') {
		equipements_techniques_selectionnes_length = equipements_techniques_selectionnes.length;
	} else {
		equipements_techniques_selectionnes_length = -1;
	}
	for (var i = 0; i < equipements_techniques_selectionnes_length; i++) {
		getcapabilities_request = url_geoserver + equipements_techniques_selectionnes[i].replace(':','/') + '/wms?service=wms&request=getcapabilities';
		/*$.ajax(getcapabilities_request).fail(function() {
			console.log('coucou');
			equipements_techniques_selectionnes.splice(i,1);
		});*/    
	}
}

/**
 * 
 * @returns
 */
function check_theme_site_orgs_selectionnes() {
	if (typeof theme_site_orgs_selectionnes !== 'undefined') {
		theme_site_orgs_selectionnes_length = theme_site_orgs_selectionnes.length;
	} else {
		theme_site_orgs_selectionnes_length = -1;
	}
	for (i = 0; i < theme_site_orgs_selectionnes_length; i++) {
		getcapabilities_request = url_geoserver + theme_site_orgs_selectionnes[i].replace(':','/') + '/wms?service=wms&request=getcapabilities';
	}
}

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
		for (var i = 1; i < theme_site_orgs_selectionnes_length; i++) {
			url_layers += ',' + theme_site_orgs_selectionnes[i];
		}
		if (equipements_techniques_selectionnes_length > 0) {
			for (var j = 0; j < equipements_techniques_selectionnes_length; j++) {
				url_layers += ',' + equipements_techniques_selectionnes[j];;
			}
		}
		url += encodeURIComponent(url_layers);
	} else if (equipements_techniques_selectionnes_length > 0) {
		url += '&layers=';
		url_layers = equipements_techniques_selectionnes[0];
		for (var k = 1; k < equipements_techniques_selectionnes_length; k++) {
			url_layers += ',' + equipements_techniques_selectionnes[k];
		}
		url += encodeURIComponent(url_layers);
	}

	// affichage du sviewer light
	if (configuration_sviewer_selectionne  == 'allegee') {
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

/**
 * décompose l'argument layers de l'url du sviewer afin de distinguer les données métiers des données sites et organismes
 * @param layers
 */
function decomposer_argument_layers(layers) {
	liste_layers = layers.split(',');
	liste_layers.forEach(function(layer) {
		if (layer.search('sv_sitorg') != -1) {
			theme_site_orgs_selectionnes = layer;
		} else if (layer.search('sv_metier') != -1) {
			equipements_techniques_selectionnes = layer;
		}
	});
}

/**
 * 
 * @param id_text_area
 * @returns
 */
function gerer_changement_url(id_text_area) {
	var layers;
	var url_text_area = $('#'+id_text_area).val();
	var url_text_area_split1 = url_text_area.split('?');
	url_sviewer = url_text_area_split1[0];
	var url_text_area_split2 = url_text_area_split1[1].split('&');
	url_text_area_split2.forEach(function(argument) {
		var argument_split = argument.split("=");
		switch (argument_split[0]) {
			case 'x':
				map_centre_lng = argument_split[1]; 
				break;
			case 'y':
				map_centre_lat = argument_split[1];
				break;
			case 'z':
				map_zoom  = argument_split[1]; 
				break;
			case 'lb':
				fond_plan_defaut_selectionne = argument_split[1]; 
				break;
			case 'title':
				var titre = (argument_split[1].split('"'))[0];
				titre_carte = decodeURIComponent(titre);
				break;
			case 'layers':
				layers = decodeURIComponent(argument_split[1]);
				decomposer_argument_layers(layers);
				break;
			case 'c':
				configuration_sviewer_selectionne = argument_split[1]; 
				break;
		}
	});
	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
}


/**
* ajouter dans le html, le code permettant d'afficher l'url du sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_url_sviewer(url_sviewer) {
	var contenu_html = '<div class="padding_bottom">'
					+  '<textarea id="url_carte" onchange="gerer_changement_url(\'url_carte\')" class="form-control">' + url_sviewer + ' </textarea> </div>';
	$('#affichage_url_sviewer').html(contenu_html);
}

/**
* ajouter dans le html, le code permettant d'afficher le code source de l'iframe
* @Param largeur_iframe     largeur du cadre contenant le sviewer
* @Param hauteur_iframe     hauteur du cadre contenant le sviewer
* @Param url_sviewer   l'url du sviewer à afficher  
*/
function afficher_code_iframe(url_sviewer) {
	var iframe = '<iframe frameborder="0" width="'+ largeur_iframe +'" height="'+ hauteur_iframe +'" src="'+ url_sviewer +'"> </iframe>';
	var contenu_html = '<div class="padding_bottom">'
						+ '<textarea id="code_iframe" onchange="gerer_changement_url(\'code_iframe\')" class="form-control">' + iframe + ' </textarea> </div>';
	$('#affichage_code').html(contenu_html);
}

/**
* affichage de l'iframe contenant l'url du sviewer crée
* @Param largeur_iframe     largeur du cadre contenant le sviewer
* @Param hauteur_iframe     hauteur du cadre contenant le sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_resultat_iframe(url_sviewer) {
	
	var iframe = '<iframe id="iframe_sviewer" width="'+ largeur_iframe_glimpse +'" height="'+ hauteur_iframe_glimpse +'" src="'+ url_sviewer +'"> </iframe>';
	var webComponent = '<link rel="import" href="'+ url_sviewer +'">';
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
    afficher_code_iframe(url_sviewer);
    afficher_resultat_iframe(url_sviewer);
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

/**
 * 
 * @param linkParams paremetre de l'url envoyé par le sviewer
 * 
 */
function interactWithSviewer(linkParams) {
	if (typeof linkParams.y !== 'undefined') {
		map_centre_lat = linkParams.y;
	}
	if (typeof linkParams.x !== 'undefined') {
		map_centre_lng = linkParams.x;
	}
	if (typeof linkParams.z !== 'undefined') {
		map_zoom = linkParams.z;
	}
	if (typeof linkParams.title !== 'undefined') {
		titre_carte = linkParams.title;
	}
	if (typeof linkParams.lb !== 'undefined') {
		fond_plan_defaut_selectionne = linkParams.lb;
	}
	
	var url_sviewer = generer_url_sviewer();
	afficher_url_sviewer(url_sviewer);
    afficher_code_iframe(url_sviewer);
}

// récuperation de la commune choisi lors de la selection dans la liste déroulante 
// puis modification de l'url du sviewer, du code html de l'iframe et de l'affichage du résultat
$('#liste_communes').on('select2:select', function (e) {
	var commune_choisie = e.params.data;
	map_centre_lng = commune_choisie.x;
	map_centre_lat = commune_choisie.y;
	map_zoom = commune_choisie.zoom;
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
	configuration_sviewer_selectionne  = $('input[name=configuration_sviewer]:checked').val();
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

$('#largeur_iframe_pixel').on('input', function() {
	largeur_iframe = $('#largeur_iframe_pixel').val();
 	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

$('#hauteur_iframe_pixel').on('input', function() {
	hauteur_iframe = $('#hauteur_iframe_pixel').val();
 	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

$('#largeur_iframe_pourcent').on('input', function() {
	largeur_iframe = $('#largeur_iframe_pourcent').val() + '%';
 	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

$('#hauteur_iframe_pourcent').on('input', function() {
	hauteur_iframe = $('#hauteur_iframe_pourcent').val() + '%';
 	var url_sviewer = generer_url_sviewer();
	afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
 });

$('input[name=taille_iframe]').change(function() {
	var unite_taille_iframe_selectionne  = $('input[name=taille_iframe]:checked').val();
	if (unite_taille_iframe_selectionne == 'pixels') {
		$('#largeur_iframe_pixel').attr("disabled",false);
		$('#hauteur_iframe_pixel').attr("disabled",false);
		$('#largeur_iframe_pourcent').attr("disabled",true);
		$('#hauteur_iframe_pourcent').attr("disabled",true);
		largeur_iframe = $('#largeur_iframe_pixel').val();
		hauteur_iframe = $('#hauteur_iframe_pixel').val();
	} else if (unite_taille_iframe_selectionne == 'pourcentage') {
		$('#largeur_iframe_pixel').attr("disabled",true);
		$('#hauteur_iframe_pixel').attr("disabled",true);
		$('#largeur_iframe_pourcent').attr("disabled",false);
		$('#hauteur_iframe_pourcent').attr("disabled",false);
		largeur_iframe = $('#largeur_iframe_pourcent').val()+'%';
		hauteur_iframe = $('#hauteur_iframe_pourcent').val()+'%';
	}
	var url_sviewer = generer_url_sviewer();
    afficher_resultat(url_sviewer, largeur_iframe, hauteur_iframe);
});



// récupération des informations contenues dans le fichier de configuration "configuration.json"
$.when(get_configuration_data()).done(function(configuration) {
    $('.nom_application').html(configuration.nom_application);
    $('.text_explicatif').html(configuration.titre_application);
    $('#detail_text').html(configuration.detail_text);
    $('#explication_point_interrogation').append(' ' + configuration.explication_point_interrogation);
    $('#partie_configuration_carte').prepend(configuration.partie_configuration_carte[0].nom_partie_configuration_carte + ' ');
    $('#titre_partie_cadrage').prepend(configuration.partie_configuration_carte[0].nom_choix_cadrage + ' ');
    $('#titre_choix_donnees').prepend(configuration.partie_configuration_carte[0].nom_choix_donnees + ' ');
    $('#label_fond_plan').html(configuration.partie_configuration_carte[0].nom_label_fond_plan);
    $('#label_sites_orgs').html(configuration.partie_configuration_carte[0].nom_label_sites_orgs);
    $('#label_donnees_metiers').html(configuration.partie_configuration_carte[0].nom_label_donnees_metires);
    $('#titre_choix_interface').prepend(configuration.partie_configuration_carte[0].nom_choix_interface + ' ');
    $('#label_configuration_complete').append(configuration.partie_configuration_carte[0].nom_interface_complete);
    $('#label_configuration_allegee').append(configuration.partie_configuration_carte[0].nom_interface_allegee);
    $('#titre_titre_carte').prepend(configuration.partie_configuration_carte[0].nom_choix_titre_carte + ' ');
    $('#titre_taille_carte').html(configuration.partie_configuration_carte[0].nom_choix_taille_carte);
    $('#titre_apercu_carte').prepend(configuration.partie_apercu_carte[0].nom_partie_apercu_carte + ' ');
    $('#titre_partage').prepend(configuration.partie_partage[0].nom_partie_partage + ' ');
    $('#label_largeur_pixel').html(configuration.partie_partage[0].nom_label_largeur);
    $('#label_hauteur_pixel').html(configuration.partie_partage[0].nom_label_hauteur);
    $('#label_largeur_pourcent').html(configuration.partie_partage[0].nom_label_largeur);
    $('#label_hauteur_pourcent').html(configuration.partie_partage[0].nom_label_hauteur);
    $('#largeur_iframe').val(configuration.partie_configuration_carte[0].largeur_carte_par_defaut);
    $('#hauteur_iframe').val(configuration.partie_configuration_carte[0].hauteur_carte_par_defaut);
    $('#titre_envoie_lien').prepend(configuration.partie_partage[0].nom_champ_url + ' ');
    $('#lien_reducteur_url').html(configuration.partie_partage[0].nom_lien_reducteur_url);
    $('#titre_taille_iframe').html(configuration.partie_partage[0].nom_titre_taille_iframe);
    $('#label_taille_pixel').append(configuration.partie_partage[0].nom_label_pixel);
    $('#label_taille_pourcent').append(configuration.partie_partage[0].nom_label_pourcentage);
    $('#code_html_iframe').prepend(configuration.partie_partage[0].nom_champ_code_html + ' ');
    $('.version').append( "<p> version "+ configuration.numero_version +"</p>" );
    
    $('#largeur_iframe_pixel').attr('value', configuration.partie_partage[0].largeur_iframe_pixel_defaut);
    $('#hauteur_iframe_pixel').attr('value', configuration.partie_partage[0].hauteur_iframe_pixel_defaut);
    $('#largeur_iframe_pourcent').attr('value', configuration.partie_partage[0].largeur_iframe_pourcent_defaut);
    $('#hauteur_iframe_pourcent').attr('value', configuration.partie_partage[0].hauteur_iframe_pourcent_defaut);
    
    // informations d'aide
    $('#aide_configuration_carte').popover({
        content: configuration.partie_configuration_carte[0].infobulle_configuration_carte
    });
    $('#aide_titre_carte').popover({
        content: configuration.partie_configuration_carte[0].infobulle_titre_carte
    });
    $('#aide_cadrage').popover({
        content: configuration.partie_configuration_carte[0].infobulle_choix_cadrage
    });
    $('#aide_choix_interface').popover({
        content: configuration.partie_configuration_carte[0].infobulle_choix_interface
    });
    $('#aide_choix_donnees').popover({
        content: configuration.partie_configuration_carte[0].infobulle_choix_donnees
    });
    $('#aide_apercu').popover({
        content: configuration.partie_apercu_carte[0].infobulle_apercu_carte
    });
    $('#aide_partage').popover({
        content: configuration.partie_partage[0].infobulle_partage
    });
    $('#aide_envoyer_lien').popover({
        content: configuration.partie_partage[0].infobulle_envoyer_lien
    });
    $('#aide_integrer_carte').popover({
        content: configuration.partie_partage[0].infobulle_integrer_carte
    });
    
    url_api_cadastre = configuration.url_api_cadastre_Rennes_Metropole;
    url_sviewer = configuration.localisation_sviewer;
    url_geoserver = configuration.url_geoserver;

    largeur_iframe = configuration.partie_configuration_carte[0].largeur_carte_apercu;
	hauteur_iframe = configuration.partie_configuration_carte[0].hauteur_carte_apercu;
	
    largeur_iframe_glimpse = configuration.partie_configuration_carte[0].largeur_carte_apercu;
	hauteur_iframe_glimpse = configuration.partie_configuration_carte[0].hauteur_carte_apercu;

	map.setZoom(configuration.partie_configuration_carte[0].zoom_carte_par_defaut);
	$('#titre_sviewer').val(configuration.partie_configuration_carte[0].titre_carte_par_defaut);
	titre_carte = $('#titre_sviewer').val();
	
	$( "#liste_site_org_cb" ).prop( "checked", false);
	$( "#liste_equipements_techniques_cb" ).prop( "checked", false);
    
    $.when(get_liste_communes()).done(function(liste_communes) {
		var data_communes = $.map(liste_communes.features, function (commune) {
	    	return { text: commune.properties.nom, id: commune.properties.code_insee,
	    			x: commune.properties.x, y: commune.properties.y, zoom: commune.properties.Zoom,
	    			coordonnees: commune.geometry.coordinates}
		});
		afficher_select2('liste_communes', data_communes, 'choix de la commune', true, false);
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

$('#copy_url').on('click', function(e) {
	$("#url_carte").select();
	document.execCommand('copy');
});

$('#copy_code').on('click', function(e) {
	$("#code_iframe").select();
	document.execCommand('copy');
});

