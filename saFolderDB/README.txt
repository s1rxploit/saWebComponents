FolderDB design specifications, by Rene Veerman, (C) (R) 2016 Rene Arnoldus Johannes Maria Veerman, amsterdam.nl
Last updated : 2016-09(Sept)-02(Friday)



After searching google for "folderDB", i noticed i have 2 competitors who use slightly different software components than i myself do.
That is a good thing.

"COMPETITORS" URLs:

GitHub - jessebsmith/folderdb
https://github.com/jessebsmith/folderdb

NPM folderdb
https://www.npmjs.com/package/folderdb

SeductiveApps' FolderDB
https://github.com/seductiveapps/folderDB



FOLDER PATH STRUCTURE SKETCH
rene@BuderTheCrow:~/data1/htdocs/new.localhost/opensourcedBySeductiveApps.com/folderDB$ find .

.
./todo.platform.txt
./code
./code/1.0.0
./code/1.0.0/boot.php
./code/1.0.0/folderDB-1.0.0.php
./code/1.0.0/config_files
./code/1.0.0/config_files/configs__infected_with_malware.json
./code/1.0.0/config_files/configs__in_store.json
./code/1.0.0/config_files/configs__currently_unparsable.json
./code/1.0.0/config_files/store
./code/1.0.0/config_files/store/whitelist_antispam__ABC.json
./code/1.0.0/config_files/store/whitelist_languages__html.json
./code/1.0.0/config_files/store/whitelist_antispam__XYZ.json
./code/1.0.0/config_files/store/whitelist_companies__google.json
./code/1.0.0/config_files/configs__permissions_list.json
./code/1.0.0/config_files/logs
./code/1.0.0/config_files/logs/usage.log.txt
./code/1.0.0/config_files/logs/parse_stages.log.txt
./code/1.0.0/config_files/logs/history
./code/1.0.0/config_files/logs/history/2015-2016
./code/1.0.0/config_files/logs/history/2015-2016/2015-01(Jan)-01(NameOfDayInWeek)
./code/1.0.0/config_files/logs/history/2015-2016/2015-12(Dec)-31(NameOfDayInWeek)
./code/1.0.0/functions.php
./code/1.0.0/classes
./code/1.0.0/classes/name_of_subcomponent
./code/1.0.0/classes/name_of_subcomponent/1.0.0
./code/1.0.0/classes/name_of_subcomponent/1.0.0/boot.php
./code/1.0.0/classes/name_of_subcomponent/1.0.0/name_of_subcomponent-1.0.0.php
./code/1.0.0/classes/name_of_subcomponent/boot.php
./code/boot.php
./code/lib
./code/lib/jquery-1.12.4.min.js
./code/lib/jquery-1.12.4.js
./README.txt
./database_data
./database_data/physical_disks
./database_data/physical_disks/diskB
./database_data/physical_disks/diskB/data_stored_on_this_disk
./database_data/physical_disks/diskB/data_stored_on_this_disk/A.json
./database_data/physical_disks/diskB/data_stored_on_this_disk/AZaz09-.-_-_.json
./database_data/physical_disks/diskB/data_stored_on_this_disk/B.json
./database_data/physical_disks/diskB/design__diskManufacterInfo.json
./database_data/physical_disks/diskB/design__diskReadSpeedInfo.json
./database_data/physical_disks/diskB/design__diskWriteSpeedInfo.json
./database_data/physical_disks/diskA
./database_data/physical_disks/diskA/data_stored_on_this_disk
./database_data/physical_disks/diskA/data_stored_on_this_disk/A.json
./database_data/physical_disks/diskA/data_stored_on_this_disk/AZaz09-.-_-_.json
./database_data/physical_disks/diskA/data_stored_on_this_disk/B.json
./database_data/physical_disks/diskA/design__diskManufacterInfo.json
./database_data/physical_disks/diskA/design__diskReadSpeedInfo.json
./database_data/physical_disks/diskA/design__diskWriteSpeedInfo.json



MAIN CONFIGURATION FILE

-- folderDB's configuration file :
<?php
$folderDB = require_once('.../path/to/folderDB/boot.php');

// set up configuration
// set up configuration
$database_options = array(
	'name' => 'myFolder',
	'storage' => array (
            'path' => './myFolder', // Location to store files (file-path)
        ),
	'requires' => array(	
		'mongo' => array(
			'stage0__boot' => array (
				'connectionString' => 'mongodb://localhost:27017/test',
				'collectionPrefix' => 'myfolder'
			)
		),
		'jQuery' => array (
			'stage0__boot' => array (
				'CDN_address' => 'https://code.jquery.com/jquery-1.12.4.min.js', // supports older OS versions
				'CDN_include_code__html' => '<script   src="https://code.jquery.com/jquery-1.12.4.min.js"   integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="   crossorigin="anonymous"></script>'
			)
		),
		'jQueryUI' => array (
			'stage0__boot' => array (
				'CDN_address' => 'https://code.jquery.com/ui/1.11.4/jquery-ui.min.js', // supports older OS versions
				'CDN_include_code__html' => '<script   src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"   integrity="sha256-xNjb53/rY+WmG+4L6tTl9m6PpqknWZvRt0rO1SRnJzw="   crossorigin="anonymous"></script>'
			)
		)

	),
	'optionalComponents' => array(
		'myComponentzName' => array (
			'stage0__boot.php' => array(
				'currentVersion' => '1.0.0' // 1.0.0 is to point to a folder like .../FolderDB/code/1.0.0/boot.php
			)
		)
	)
);
 
$folderDB_options = array (
    'database_options' => $database_options
);

// init a local folder for storing files
$myFolder = new folderDB($folderDB_options);
$myFolder->setOptions($folderDB_options)
OR
$myFolder = new folderDB($folderDB_options);
?>

SEE ALSO

http://ufonts.com/fonts/folderdb-normal.html

SEE ALSO the birth of this project:

https://github.com/seductiveapps/folderDB/blob/master/design%20specifications%20at%20facebook-dot-com-slash-ReneVeermanSeductiveApps/design%20specifications%20urls.txt

[fb-video] FolderDB-1.0.0 how to store paper notes in a cloth wallet
https://www.facebook.com/ReneVeermanSeductiveApps/videos/1757957871136925/

[fb-photo] FolderDB-1.0.0 filesystem paths design documents page 1of2
https://www.facebook.com/ReneVeermanSeductiveApps/videos/1757953001137412/

[fb-photo_album-thumbnailpage] FolderDB-1.0.0 filesystem design folder and filename design page
https://www.facebook.com/ReneVeermanSeductiveApps/media_set?set=a.1757952084470837.1073741891.100007681876979&type=3

[fb-photo] FolderDB filesystem paths sketch 1.0
https://www.facebook.com/ReneVeermanSeductiveApps/videos/1757951511137561/


