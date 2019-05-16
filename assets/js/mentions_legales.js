// récupération des informations contenues dans le fichier de configuration "configuration.json"
$.when(get_configuration_data()).done(function(configuration) {
    $('.nom_application').html(configuration.nom_application + ' mentions légales');
    $('.text_explicatif').html(configuration.titre_application);
    $('.version').append( "<p> version "+ configuration.numero_version +"</p>" );
});