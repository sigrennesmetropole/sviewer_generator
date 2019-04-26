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
* ajouter dans le html, le code permettant d'afficher l'url du sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_url_sviewer(url_sviewer) {
	var contenu_html = '<div class="affichage_horizontal"> <label class="form-check-label espace_droite" for="conf_complete"> URL sviewer </label>'
					+  '<textarea readonly class="form-control" readonly>' + url_sviewer + ' </textarea> </div>';
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
	var contenu_html = '<div class="affichage_horizontal"> <label class="form-check-label espace_droite" for="conf_complete"> code HTML </label>'
						+ '<textarea readonly class="form-control" readonly>' + iframe + ' </textarea> </div>';
	$('#affichage_code').html(contenu_html);
}

/**
* affichage de l'iframe contenant l'url du sviewer crée
* @Param largeur_iframe     largeur du cadre contenant le sviewer
* @Param hauteur_iframe     hauteur du cadre contenant le sviewer
* @Param url_sviewer   l'url du sviewer à afficher 
*/
function afficher_resultat_iframe(largeur_iframe, hauteur_iframe, url_sviewer) {
	var iframe = '<iframe width="'+ largeur_iframe +'" height="'+ hauteur_iframe +'" src="'+ url_sviewer +'"> </iframe>';
	$('#visualisation_resultat').html(iframe);
}

/**
*/
function deplacer_footer() {
	$('#application').css('height','800');
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
    deplacer_footer();
}

// affiche le numéro de version de l'application
$('#version').append( "<p> version "+ num_version +"</p>" );
