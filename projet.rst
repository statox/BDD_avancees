=========================================================================
Définition et mise en œuvre d'une infrastructure de stockage sous Mongodb
=========================================================================

Présentation du contexte
========================

Il s'agit de mettre en place une architecture de base de donnée pour
l'inventaire d'un campus disposant de plusieurs bâtiments. Le système actuel
repose sur du XML sur lequel on devra baser notre conception et on souhaite
effectuer une partition des données par bâtiment.

Pour cela, nous utiliseront des technologies NOSQL, et plus spécifiquement
Mongodb dans l'implémentation de notre base de données.

Modèle Relationnel équivalent
=============================

La méthodologie utilisée pour la construction du modèle relationnel est que
nous avons sélectionné les éléments contenant des champs ID et nous en sommes
servi comme point de repère pour choisir les tables. Nous avons également
fait toutes les tables complémentaires qui semblaient s'imposer (champs
communs d'un élément à l'autre) au cours de la formation des tables
précédentes.

Mise en œuvre en NOSQL
======================

Stockage des informations dans la bdd
-------------------------------------

Nous devons faire une partition par rapport au bâtiment auquel sont liées les
données. Pour des raisons de simplicité d'implémentation nous avons décidé
dans un premier temps de ne pas séparer le "document" XML en plusieurs
documents JSON, nous avons réalisé une simple transposition d'une syntaxe
vers l'autre.

Un exemple de document peut être trouvé en annexe.

Pour stocker les informations nous avons décidé de faire du sharding en
séparant les informations suivant l'id du bâtiment de l'inventaire (c'est
notre "shard key").

La base de donnée s'appellera "inventaires_db".

Mise en place de l'infrastructure
---------------------------------

L'infrastructure est ici simple. Nous avons monté trois machines virtuelles
(VMAdmin, VMA, VMB) qui sont dans le même réseau.

VMAdmin est là pour acceuillir le serveur de configuration et l'instance
mongos qui va contrôler le reste. Nous n'avons pas vu de raison de les mettre
sur des serveurs séparés.

La configuration exacte de mongodb sur VMAdmin peut être trouvée en annexe.

Dans les grandes lignes nous avons fait ce qui était nécessaire pour
permettre la connectivité entre les machines, conservé un maximum de
paramètres par défaut et activé l'interface REST.

Le fichier de configuration mongodb.conf des autres machines est similaire.

Le serveur de configuration et mongos sont lancés avec :

.. code:: sh

    mongod --configsvr
    mongos --configsdb VMAdmin

Nous avons fait les modifications nécessaire au fichier /etc/hosts donc
VMAdmin pointe vers la VM elle-même, et correspond à l'ip complète plutôt que
localhost car nous avons pu lire que l'inverse posait des problèmes.

.. code:: raw

    192.168.0.1  VMAdmin
    192.168.0.10 VMA
    192.168.0.3  VMB

Cess addresses ne seront à priori pas importantes pour la suite, nous nous
contenteront de VMAdmin, VMA et VMB pour désigner les machines.

Les serveurs de sharding ont été lancés sur VMA et VMB avec la commande
suivante sur chacun des serveurs:

.. code:: raw

    mongod --shardsvr

Puis sur VMAdmin:

.. code:: shell

    mongo localhost:27017/admin
    > db.runCommand({addshard: "192.168.0.10"});
    > db.runCommand({addshard: "192.168.0.3"});
    > db.runCommand({enablesharding: "inventaires_db"});

Contrôle de la répartition des données
======================================

Définition des règles de répartition
------------------------------------

Contrôle du Shard
-----------------

Requêtes d'extraction des données
=================================

Conclusion sur la mise en œuvre et le choix Mongodb
===================================================



.. raw:: pdf

    PageBreak

======
Annexe
======


Configuration du serveur mongodb sur VMAdmin
============================================

.. code:: text

    root@VMAdmin:/etc# cat mongodb.conf
    # mongodb.conf

    # Where to store the data.
    dbpath=/var/lib/mongodb

    #where to log
    logpath=/var/log/mongodb/mongodb.log

    logappend=true

    bind_ip = 127.0.0.1,193.168.0.1,192.168.0.10,192.168.0.3
    port = 27017

    # Enable journaling, http://www.mongodb.org/display/DOCS/Journaling
    journal=true

    # Enables periodic logging of CPU utilization and I/O wait
    #cpu = true

    # Turn on/off security.  Off is currently the default
    #noauth = true
    #auth = true

    # Verbose logging output.
    #verbose = true

    # Inspect all client data for validity on receipt (useful for
    # developing drivers)
    #objcheck = true

    # Enable db quota management
    #quota = true

    # Set oplogging level where n is
    #   0=off (default)
    #   1=W
    #   2=R
    #   3=both
    #   7=W+some reads
    #oplog = 0

    # Diagnostic/debugging option
    #nocursors = true

    # Ignore query hints
    #nohints = true

    # Disable the HTTP interface (Defaults to localhost:27018).
    #nohttpinterface = true

    # Turns off server-side scripting.  This will result in greatly limited
    # functionality
    #noscripting = true

    # Turns off table scans.  Any query that would do a table scan fails.
    #notablescan = true

    # Disable data file preallocation.
    #noprealloc = true

    # Specify .ns file size for new databases.
    # nssize = <size>

    # Accout token for Mongo monitoring server.
    #mms-token = <token>

    # Server name for Mongo monitoring server.
    #mms-name = <server-name>

    # Ping interval for Mongo monitoring server.
    #mms-interval = <seconds>

    # Replication Options

    # in replicated mongo databases, specify here whether this is a slave or master
    #slave = true
    #source = master.example.com
    # Slave only: specify a single database to replicate
    #only = master.example.com
    # or
    #master = true
    #source = slave.example.com

    # Address of a server to pair with.
    #pairwith = <server:port>
    # Address of arbiter server.
    #arbiter = <server:port>
    # Automatically resync if slave data is stale
    #autoresync
    # Custom size for replication operation log.
    #oplogSize = <MB>
    # Size limit for in-memory storage of op ids.
    #opIdMem = <bytes>

    ### NON DEFAULT

    replSet=BatAdmin
    fork=true
    quiet=true
    rest=true

Annexe 1: Exemple de document JSON
==================================

.. code:: json

    {
      "Inventaire": {
        "Licenses": {
          "Stock": {
            "id": "1",
            "Logiciels": {
              "AOSLP": {
                "Type": "ALP",
                "id": "2",
                "Nom": "MS Visio 2013 Std",
                "BC": {
                  "Num": "1",
                  "Date": "27/06/2013",
                  "De": "Toto",
                  "A": "Tata",
                  "Pour": "Titi"
                }
              }
            }
          },
          "Commands": {
            "id": "17",
            "Logiciels": {
              "AOSLP": {
                "Type": "ALP",
                "id": "18",
                "Nom": "Mapple ",
                "BC": {
                  "Num": "2",
                  "Date": "14/02/2014",
                  "De": "Toto",
                  "A": "Toutou",
                  "Pour": "Tintin"
                }
              }
            }
          }
        },
        "Batiment2" :{
          "id": "38",
          "Num": "2",
          "Nom": "BatimentB",
          "Serveurs": {
            "id": "39",
            "IPDom": {
              "Dom": [
                {
                  "value": "192.168.31.0/24",
                  "dns": "8.8.8.8",
                  "comment": "Postes fixes"
                },
                {
                  "value": "192.168.32.0/24",
                  "dns": "8.8.8.8",
                  "comment": "Postes DMZ"
                }
              ]
            },
            "DNS": { "Server": "8.8.8.8, 8.8.4.4" },
            "NTP": { "Server": "ntp.mydomain.fr" },
            "WINS": { "Server": "wins.mydomain.fr" },
            "Annuaire": {
              "Server": "192.168.31.10",
              "DN": "ou=people, dc=en, dc=fr",
              "Port": "389"
            },
            "Mail": {
              "Serveur": {
                "protocole": "SMTP",
                "adresse": "smtp.mydomain.fr"
              }
            },
            "Proxy": {
              "Type": "http",
              "Adresse": "http://proxy.pac.mydomain.fr",
              "Port": "80"
            }
          },
          "IPReserve": {
            "id": "39",
            "Adresse": {
              "id": "40",
              "Dom": "192.168.31.0/24",
              "IP": "192.168.31.20",
              "MAC": "FF:AA:CC:DD:EE:FF",
              "Utilisateur": "Tata",
              "Ordinateur": "tataPC",
              "Complement": {
                "Correspondant": "Pouet",
                "DateFin": "31/12/2099"
              }
            }
          },
          "Salle": {
            "id": "150",
            "Num": "Z",
            "Nom": "Ordinateurs étudiants",
            "Ordinateur": {
              "id": "151",
              "Nom": "Puppy",
              "Type": "PC",
              "Marque": "DELL",
              "Modele": "XPD",
              "Processeur": "i7",
              "Poste": {
                "Type": "Poste de travail",
                "Valeur": "43"
              },
              "Identification": {
                "Sn": "Pouet",
                "IdInt": "4545",
                "IdExt": "2525",
                "Tutelle": "NSA"
              },
              "OS": {
                "Type": "ALP",
                "id": "143",
                "Nom": "Windows 7",
                "BC": {
                  "Num": "13",
                  "Date": "23/03/2014",
                  "De": "Tutu",
                  "A": "Tonton",
                  "Pour": "Tata"
                },
                "Passe": {
                  "id": "153",
                  "#text": "Administrateur : azerty"
                },
                "Droits": "Utilisateur sans pouvoirs",
                "Logiciels": {
                  "AOSLP": [
                    {
                      "Type": "SLP",
                      "id": "795",
                      "Nom": "Abobe Acrobat Reader 9.2"
                    },
                    {
                      "Type": "SLP",
                      "id": "785",
                      "Nom": "Matlab"
                    },
                    {
                      "Type": "ALP",
                      "id": "144",
                      "Nom": "iWork 08",
                      "BC": {
                        "Num": "4",
                        "Date": "05/12/2008",
                        "De": "Susu",
                        "A": "Sisi",
                        "Pour": "Sasa"
                      }
                    }
                  ]
                }
              },
              "Memoires": {
                "Memoire": [
                  {
                    "id": "145",
                    "Type": "RAM",
                    "Valeur": "1"
                  },
                  {
                    "id": "146",
                    "Type": "HD",
                    "Valeur": "80"
                  }
                ]
              },
              "BC": {
                "Num": "15",
                "Date": "09/05/2011",
                "De": "Sonson",
                "A": "Sisi",
                "Pour": "Sasa"
              },
              "Garantie": {
                "Livraison": "09/05/2011",
                "Duree": "1 ans"
              },
              "Affectations": {
                "Anciennes": "Tonton",
                "Actuelle": "Sisi",
                "Date": "31/05/2011"
              },
              "Net": {
                "id": "147",
                "Dom": "192.168.31.0/24",
                "IP": "192.168.31.2",
                "MAC": "B1:GB:00:B5:00:00"
              },
              "Commentaire": {
                "id": "148",
                "Date": "31/05/2011"
              },
              "Intervention": {
                "id": "243",
                "Date": "08/09/2012",
                "#text": "Reparation ecran"
              },
            },
            "Ecran": {
              "id": "159",
              "Marque": "DELL",
              "Modele": "P190Sb",
              "Type": "LCD",
              "Taille": "19",
              "Identification": {
                "Sn": "Pouet2",
                "IdInt": "1202D",
                "IdExt": "2422C",
                "Tutelle": "Université Orléans"
              },
              "BC": {
                "Num": "6",
                "Date": "12/12/2009",
                "De": "Université Orléans",
                "A": "Toto",
                "Pour": "ASR"
              },
              "Garantie": {
                "Livraison": "03/01/2009",
                "Duree": "5 ans"
              },
              "Affectations": {
                "Anciennes": "neuf",
                "Actuelle": "inactif",
                "Date": "01/02/2012"
              }
            },
            "Peripherique": {
              "Nom": "switch1",
              "id": "163",
              "Type": "Switch",
              "Caracteristiques": "-",
              "Marque": "DELL",
              "Modele": "PRS",
              "Connexion": "eth",
              "Identification": {
                "Sn": "Pouet3",
                "IdInt": "1009o",
                "IdExt": "93319",
                "Tutelle": "Université Orléans"
              },
              "BC": {
                "Num": "8",
                "Date": "13/12/2010",
                "De": "Université Orléans",
                "A": "Tata",
                "Pour": "BSR"
              },
              "Garantie": {
                "Livraison": "14/12/2010",
                "Duree": "3 ans"
              },
              "Affectations": {
                "Anciennes": "neuf",
                "Actuelle": "ASR",
                "Date": "18/06/2013"
              }
            }
          }
        },
        "Batiment1": {
          "id": "37",
          "Num": "1",
          "Nom": "Batiment1",
          "Serveurs": {
            "id": "38",
            "IPDom": {
              "Dom": [
                {
                  "value": "192.168.0.0/24",
                  "dns": "8.8.8.8",
                  "comment": "Postes fixes"
                },
                {
                  "value": "192.168.1.0/24",
                  "dns": "8.8.8.8",
                  "comment": "Postes DMZ"
                }
              ]
            },
            "DNS": { "Server": "8.8.8.8, 8.8.4.4" },
            "NTP": { "Server": "ntp.mydomain.fr" },
            "WINS": { "Server": "wins.mydomain.fr" },
            "Annuaire": {
              "Server": "192.168.0.10",
              "DN": "ou=people, dc=en, dc=fr",
              "Port": "389"
            },
            "Mail": {
              "Serveur": {
                "protocole": "SMTP",
                "adresse": "smtp.mydomain.fr"
              }
            },
            "Proxy": {
              "Type": "http",
              "Adresse": "http://proxy.pac.mydomain.fr",
              "Port": "80"
            }
          },
          "IPReserve": {
            "id": "39",
            "Adresse": {
              "id": "40",
              "Dom": "192.168.2.0/24",
              "IP": "150",
              "MAC": "AA:BB:CC:DD:EE:FF",
              "Utilisateur": "Toto",
              "Ordinateur": "totoPC",
              "Complement": {
                "Correspondant": "Pouet",
                "DateFin": "31/12/2099"
              }
            }
          },
          "Salle": {
            "id": "140",
            "Num": "C",
            "Nom": "Matériels en réserve",
            "Ordinateur": {
              "id": "141",
              "Nom": "Kitty",
              "Type": "Macintosh",
              "Marque": "Apple",
              "Modele": "G4",
              "Processeur": "i7",
              "Poste": {
                "Type": "Poste de travail",
                "Valeur": "42"
              },
              "Identification": {
                "Sn": "Pouet",
                "IdInt": "4242",
                "IdExt": "2424",
                "Tutelle": "Non"
              },
              "OS": {
                "Type": "ALP",
                "id": "142",
                "Nom": "MacOS 10.5",
                "BC": {
                  "Num": "3",
                  "Date": "23/03/2014",
                  "De": "Tutu",
                  "A": "Tonton",
                  "Pour": "Tutu"
                },
                "Passe": {
                  "id": "143",
                  "#text": "Administrateur : azerty"
                },
                "Droits": "Utilisateur avec pouvoirs",
                "Logiciels": {
                  "AOSLP": [
                    {
                      "Type": "SLP",
                      "id": "795",
                      "Nom": "Abobe Acrobat Reader 9.2"
                    },
                    {
                      "Type": "ALP",
                      "id": "144",
                      "Nom": "iWork 08",
                      "BC": {
                        "Num": "4",
                        "Date": "05/12/2008",
                        "De": "Susu",
                        "A": "Sisi",
                        "Pour": "Sasa"
                      }
                    }
                  ]
                }
              },
              "Memoires": {
                "Memoire": [
                  {
                    "id": "145",
                    "Type": "RAM",
                    "Valeur": "1"
                  },
                  {
                    "id": "146",
                    "Type": "HD",
                    "Valeur": "80"
                  }
                ]
              },
              "BC": {
                "Num": "5",
                "Date": "09/04/2011",
                "De": "Sonson",
                "A": "Sisi",
                "Pour": "Sasa"
              },
              "Garantie": {
                "Livraison": "04/12/2002",
                "Duree": "1 ans"
              },
              "Affectations": {
                "Anciennes": "Tonton",
                "Actuelle": "Sisi",
                "Date": "31/05/2011"
              },
              "Net": {
                "id": "147",
                "Dom": "192.168.0.0/24",
                "IP": "192.168.0.2",
                "MAC": "B1:GB:00:00:00:B5"
              },
              "Commentaire": {
                "id": "148",
                "Date": "31/05/2011"
              },
              "Intervention": {
                "id": "233",
                "Date": "08/09/2014",
                "#text": "Reconditionnement total."
              },
              "Pret": {
                "id": "234",
                "Fin": "02/06/2015",
                "#text": "Utilisateur"
              }
            },
            "Ecran": {
              "id": "149",
              "Marque": "DELL",
              "Modele": "P190Sb",
              "Type": "LCD",
              "Taille": "19",
              "Identification": {
                "Sn": "Pouet2",
                "IdInt": "1201D",
                "IdExt": "2424C",
                "Tutelle": "Université Orléans"
              },
              "BC": {
                "Num": "6",
                "Date": "12/12/2009",
                "De": "Université Orléans",
                "A": "Toto",
                "Pour": "ASR"
              },
              "Garantie": {
                "Livraison": "03/01/2009",
                "Duree": "5 ans"
              },
              "Affectations": {
                "Anciennes": "neuf",
                "Actuelle": "inactif",
                "Date": "01/02/2012"
              }
            },
            "Imprimante": {
              "Nom": "imp1",
              "id": "4889",
              "Type": "laser",
              "Couleur": "oui",
              "Marque": "DELL",
              "Modele": "3010CN",
              "Connexion": "Serie",
              "Identification": {
                "Sn": "Pouet3",
                "IdInt": "1209b",
                "IdExt": "93326",
                "Tutelle": "Université Orléans"
              },
              "BC": {
                "Num": "7",
                "Date": "13/12/2009",
                "De": "Université Orléans",
                "A": "Tata",
                "Pour": "BSR"
              },
              "Garantie": {
                "Livraison": "24/12/2002",
                "Duree": "-"
              },
              "Affectations": {
                "Anciennes": "Tuntun",
                "Actuelle": "Sasa",
                "Date": "31/05/2011"
              },
              "Net": {
                "id": "4890",
                "Dom": "192.168.1.0/24",
                "IP": "192.168.1.14",
                "MAC": "DE:AD:BE:EF:00:00"
              }
            },
            "Peripherique": {
              "Nom": "rep1",
              "id": "162",
              "Type": "Réplicateur de ports",
              "Caracteristiques": "-",
              "Marque": "DELL",
              "Modele": "PRS",
              "Connexion": "USB",
              "Identification": {
                "Sn": "Pouet3",
                "IdInt": "1008o",
                "IdExt": "93313",
                "Tutelle": "Université Orléans"
              },
              "BC": {
                "Num": "8",
                "Date": "13/12/2010",
                "De": "Université Orléans",
                "A": "Tata",
                "Pour": "BSR"
              },
              "Garantie": {
                "Livraison": "04/12/2001",
                "Duree": "3 ans"
              },
              "Affectations": {
                "Anciennes": "neuf",
                "Actuelle": "ASR",
                "Date": "18/06/2013"
              }
            }
          }
        }
      }
    }

