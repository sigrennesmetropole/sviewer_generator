// Récupération les données de configuration issues du fichier de configuration
function get_configuration_data() {
	return $.ajax({
		type: 'GET',
		url: 'assets/json/configuration.json',
		dataType: "json"
	});
}

// Récupération la liste des communes issue de l'api cadastre
function get_liste_communes(api_cadastre) {
	return $.ajax({
		type: 'GET',
		url: api_cadastre + 'communes',
		dataType: "json"
	});
}

function get_liste_communes2() {
	return $.ajax({
		type: 'GET',
		url: 'assets/json/3857_Coordonnees_centre_bourg.geojson',
		//dataType: "json"
	});
}

// Récupération les differents couches provenant de la base de donnée sites et organismes
function get_donnees_sites_orgs() {
	return $.ajax({
		type: 'GET',
		url: 'assets/json/donnees_sites_orgs.json',
		dataType: "json"
	});
}

// Récupération des différents fonds de plan mis à disposition
function get_fonds_plan() {
	return $.ajax({
		type: 'GET',
		url: 'assets/json/fonds_plans.json',
		dataType: "json"
	});
}

// Récupération des couches issues des données metiers
function get_donnees_metiers() {
	return $.ajax({
		type: 'GET',
		url: 'assets/json/donnees_metiers.json',
		dataType: "json"
	});
}

//Récupération des différents fonds de plan mis à disposition
function requette_getcapabilities(test_url) {
	return $.ajax({
		type: 'GET',
		url: test_url,
		dataType: "xml"
	});
}




