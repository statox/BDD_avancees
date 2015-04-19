/*
 * Requetes répondant à la question 5 du sujet
 */

//Liste des postes du batiment A (NOM, Salle)

db.inventaire.find({item: "ordinateur", "Batiment.Nom": "Batiment1"}, {_nom:1, Salle:1});

//Liste des postes de type DELL sur l’ensemble de la bdd

db.inventaire.find({item: "ordinateur", "Marque": "DELL"});

//Liste des adresses IP occupée de la plage 192.168.31.0/24

db.inventaire.find({item: "ipreserves", "Adresse.Dom": "192.168.31.0/24"}, {"Adresse.IP":1});

//Liste des interventions par batiment

db.inventaire.find({Intervention: {$exists: true}}, {_id:0, Intervention:1, "Batiment.Nom":1} );
