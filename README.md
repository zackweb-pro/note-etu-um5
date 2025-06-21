# note-etu-um5

<div class="container">			
			
			<div><img src="css/images/lg-bannier.png" style="width: 100%"></div>
			
			<style>
/* 
======================
start dropdown-submenu 
======================
*/

.dropdown-submenu {
    position:relative;
}
.dropdown-submenu>.dropdown-menu {
    top:0;
    left:100%;
    margin-top:-6px;
    margin-left:-1px;
    -webkit-border-radius:0 6px 6px 6px;
    -moz-border-radius:0 6px 6px 6px;
    border-radius:0 6px 6px 6px;
}
.dropdown-submenu:hover>.dropdown-menu {
    display:block;
}
.dropdown-submenu>a:after {
    display:block;
    content:" ";
    float:right;
    width:0;
    height:0;
    border-color:transparent;
    border-style:solid;
    border-width:5px 0 5px 5px;
    border-left-color:#cccccc;
    margin-top:5px;
    margin-right:-10px;
}
.dropdown-submenu:hover>a:after {
    border-left-color:#ffffff;
}
.dropdown-submenu.pull-left {
    float:none;
}
.dropdown-submenu.pull-left>.dropdown-menu {
    left:-100%;
    margin-left:10px;
    -webkit-border-radius:6px 0 6px 6px;
    -moz-border-radius:6px 0 6px 6px;
    border-radius:6px 0 6px 6px;
}

/* 
====================
end dropdown-submenu 
====================
*/
</style>

<nav class="navbar navbar-default">
	<div class="container-fluid">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar" aria-expanded="true" aria-controls="navbar">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>			
		</div>
		<div id="navbar" class="navbar-collapse collapse in" aria-expanded="true">
			<ul class="nav navbar-nav">
				<li class="active"><a href="index.php?:nav=default::index"><img src="css/images/menu_home.png" alt="Accueil"></a></li>				
															 
							<li class="dropdown">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> MON PROFIL ÉTUDIANT <span class="caret"></span></a>
								<ul class="dropdown-menu">
																			<li><a href="index.php?:nav=etat_civil::index">INFORMATIONS PERSONNELLES</a></li>
																			<li><a href="index.php?:nav=iae::index">INSCRIPTION ADMINISTRATIVE</a></li>
																			<li><a href="index.php?:nav=ice::index">CONTRAT PÉDAGOGIQUE</a></li>
																	</ul>
							</li>
						 
											 
							<li class="dropdown">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> E-SCOLARITÉ <span class="caret"></span></a>
								<ul class="dropdown-menu">
																			<li><a href="index.php?:nav=attestation_inscription::index">ATTESTATION D'INSCRIPTION</a></li>
																			<li><a href="index.php?:nav=attestation_reussite::index">ATTESTATION DE RÉUSSITE</a></li>
																			<li><a href="index.php?:nav=rvn::index">RELEVÉ DE NOTES</a></li>
																			<li><a href="index.php?:nav=resultat_elp::index">NOTES ET RÉSULTATS</a></li>
																	</ul>
							</li>
						 
											 
							<li class="dropdown">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> PLANNING <span class="caret"></span></a>
								<ul class="dropdown-menu">
																			<li><a href="index.php?:nav=edt::index">MON EMPLOI DU TEMPS</a></li>
																	</ul>
							</li>
						 
											 
							<li class="dropdown">
								<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> COUVERTURE MÉDICALE <span class="caret"></span></a>
								<ul class="dropdown-menu">
																			<li><a href="index.php?:nav=amo::index">AMO-E</a></li>
																	</ul>
							</li>
						 
										
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true"><span class="nav-label"> AUTRES SERVICES </span> <span class="caret"></span></a>
						<ul class="dropdown-menu">									
							<li><a href="https://outlook.office.com/" target="new_tab">EMAIL</a></li>
							<li><a href="https://um5sma-my.sharepoint.com/" target="new_tab">STOCKAGE</a></li>
							<li><a href="https://tasks.office.com/" target="new_tab">PLANIFICATEUR</a></li>
							<li><a href="https://to-do.office.com/" target="new_tab">TO DO</a></li>	
						</ul>
					</li>							
								
				<li><a href="index.php?:nav=tutoriel::index">TUTORIELS</a></li>
				
				<li class="dropdown">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true"><span class="nav-label"> HELPDESK </span> <span class="caret"></span></a>
					<ul class="dropdown-menu">
												
						<li><a href="index.php?:nav=helpdesk::list">FAQ</a></li>						
					</ul>
				</li>
				
							</ul>
			
			<ul class="nav navbar-nav navbar-right">				
														<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="glyphicon glyphicon-user"></i> &nbsp;OUMGHAR ZAKARIA<span class="caret"></span></a>
						<ul class="dropdown-menu">
							<li><a href="index.php?:nav=oauth2::disconnect"><i class="glyphicon glyphicon-log-out"></i>&nbsp; DÉCONNEXION</a></li>
							<!--<li><a href=""><i class="glyphicon glyphicon-log-out"></i>&nbsp; D&Eacute;CONNEXION</a></li>--> 
						</ul>
					</li>
					
			</ul>
		</div><!--/.nav-collapse -->
	</div><!--/.container-fluid -->
</nav>
				
			<div class="jumbotron">			
				
<style type="text/css">
th {
	text-align:center;
}
.btn {
	font-size:12px;
}
</style>

<h6 class="text-center">
	<b>
		Notes et résultats aux éléments pédagogique<br>
		Année Universitaire  2023-2024	</b>
</h6>
<br>

<div class="text-right"><a class="btn btn-info" href="index.php?:nav=resultat_elp::index">Retour</a></div>
<br>


	<div style="overflow-x:auto;">
		<table class="table table-bordered table-striped">
			
			<tbody><tr>
				<th rowspan="2" colspan="2"></th>		
				<th colspan="3">Session 1</th>
				<th colspan="3">Session 2</th>				
			</tr>
			
			<tr>
				<th>Note</th>
				<th>Note jury</th>
				<th>Résultat</th>
								
				<th>Note</th>
				<th>Note jury</th>
				<th>Résultat</th>
							
			</tr>
			
			<tr><td><font style="padding-left: 10px">An1 génie logiciel</font></td><td>AN1</td><td>11.16</td><td></td><td>Ajourné</td><td>12.78</td><td></td><td>Admis</td></tr><tr></tr><tr><td><font style="padding-left: 30px">Se01 génie logiciel</font></td><td>SE01</td><td>9.56</td><td></td><td></td><td>11.69</td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 50px">Ethique, métiers &amp; projet de challenge</font></td><td>MO</td><td>11.56</td><td></td><td>Rattrapage</td><td>12.00</td><td></td><td>Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Projet de challenge</font></td><td>EM</td><td>5.60</td><td></td><td></td><td>12.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Initiation au Métier BI</font></td><td>EM</td><td>16.00</td><td></td><td></td><td>16.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Ethique et déontologie</font></td><td>EM</td><td>12.00</td><td></td><td></td><td>12.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Algorithmique et structures de données</font></td><td>MO</td><td>12.55</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Programmation procédurale</font></td><td>EM</td><td>15.25</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Structures de données</font></td><td>EM</td><td>9.70</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Algorithmique</font></td><td>EM</td><td>12.69</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">ARCHITECTURE DES ORDINATEURS</font></td><td>MO</td><td>6.75</td><td></td><td>Rattrapage</td><td>12.00</td><td></td><td>Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Architecture des ordinateurs</font></td><td>EM</td><td>7.00</td><td></td><td></td><td>14.50</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Assembleur microprocesseur</font></td><td>EM</td><td>6.50</td><td></td><td></td><td>14.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Eléments de recherche opérationnelle</font></td><td>MO</td><td>9.25</td><td></td><td>Rattrapage</td><td>12.00</td><td></td><td>Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Programmation linéaire</font></td><td>EM</td><td>7.50</td><td></td><td></td><td>9.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Théorie des graphes</font></td><td>EM</td><td>11.00</td><td></td><td></td><td>15.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Gestion, economie et finance 1</font></td><td>MO</td><td>7.00</td><td></td><td>Rattrapage</td><td>12.00</td><td></td><td>Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Comptabilité générale et gestion financière</font></td><td>EM</td><td>2.50</td><td></td><td></td><td>12.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Economie d’entreprise</font></td><td>EM</td><td>11.50</td><td></td><td></td><td>15.50</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Introduction au management d’entreprise</font></td><td>EM</td><td>11.50</td><td></td><td></td><td>15.50</td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Langue, communication et développement personnel</font></td><td>MO</td><td>14.63</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Ommunication et developpement personnel 1</font></td><td>EM</td><td>14.00</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">General english 1</font></td><td>EM</td><td>15.25</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Statistiques et probabilite appliquee</font></td><td>MO</td><td>5.20</td><td></td><td>Rattrapage</td><td>6.68</td><td></td><td>Non Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Statistique descriptive pour l’ingénieur</font></td><td>EM</td><td>6.50</td><td></td><td></td><td>11.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Simulation des comportements probabilistes</font></td><td>EM</td><td>1.00</td><td></td><td></td><td>1.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Probabilités</font></td><td>EM</td><td>8.00</td><td></td><td></td><td>8.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 30px">Se02 génie logiciel</font></td><td>SE02</td><td>12.75</td><td></td><td></td><td>13.87</td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 50px">Base de donnees</font></td><td>MO</td><td>14.94</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Bases de données i</font></td><td>EM</td><td>15.32</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Base de données 2</font></td><td>EM</td><td>14.56</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Economie, gestion et finance2 (gef2)</font></td><td>MO</td><td>5.20</td><td></td><td>Rattrapage</td><td>12.00</td><td></td><td>Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Management science</font></td><td>EM</td><td>1.00</td><td></td><td></td><td>12.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Analyse des coûts</font></td><td>EM</td><td>13.00</td><td></td><td></td><td>13.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Fondements de l’informatique</font></td><td>MO</td><td>12.14</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Logique des prédicats</font></td><td>EM</td><td>15.27</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Calculabilité et complexité</font></td><td>EM</td><td>9.00</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Réseaux et système</font></td><td>MO</td><td>10.95</td><td></td><td>Rattrapage</td><td>12.00</td><td></td><td>Validé</td></tr><tr></tr><tr><td><font style="padding-left: 70px">Transmission de données</font></td><td>EM</td><td>12.75</td><td></td><td></td><td>12.75</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Réseaux informatiques</font></td><td>EM</td><td>17.00</td><td></td><td></td><td>17.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Systèmes d’exploitation</font></td><td>EM</td><td>6.60</td><td></td><td></td><td>9.00</td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Langue, communication et développement personnel 2</font></td><td>MO</td><td>15.00</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Anglais 2</font></td><td>EM</td><td>15.00</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Communication et developpement personnel 2</font></td><td>EM</td><td>15.00</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Projet première année</font></td><td>MO</td><td>16.40</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Séminaires découvertes métiers</font></td><td>EM</td><td>26.00</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Projet de 1a</font></td><td>EM</td><td>16.00</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 50px">Programmation orientée objet et développement logiciel</font></td><td>MO</td><td>14.62</td><td></td><td>Validé</td><td></td><td></td><td></td></tr><tr></tr><tr><td><font style="padding-left: 70px">Développement web</font></td><td>EM</td><td>14.50</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Développement xml</font></td><td>EM</td><td>19.70</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td><font style="padding-left: 70px">Programmation orientée objet</font></td><td>EM</td><td>12.66</td><td></td><td></td><td></td><td></td><td></td></tr>			
		</tbody></table>
	</div>
	
					
			</div>
			
			<footer class="container-fluid">
					
				<div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
					<div class="row">	
						<h4 style="color: #D3CCCB;">Liens utiles</h4>
					</div>
					<br>
					<div class="row">						
						<a href="https://www.um5.ac.ma" target="new_tab">UM5</a>
					</div>
					<br>
					<div class="row">						
						<a href="https://www.enssup.gov.ma" target="new_tab">ENSSUP</a>	
					</div>
					<br>
					<div class="row">											
						<a href="https://www.cnops.org.ma" target="new_tab">CNOPS</a>
					</div>
					<br>
					<div class="row">		
						<a href="http://www.onousc.ma" target="new_tab">ONOUSC</a>
					</div>
					<br>
					<div class="row">											
						<a href="https://equivalence.enssup.gov.ma" target="new_tab">e-Équivalence</a><br><br>				
					</div>				
				</div>					
				
				<div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
					<div class="row">
						<h4 style="color: #D3CCCB;">Suivez-nous sur</h4>
					</div>
					<br>
					<div class="row">						
						<a href="https://www.facebook.com/UM5Rabat" target="new_tab"><img src="css/images/facebook_min.png"></a>
						<a href="https://twitter.com/um5rabat" target="new_tab"><img src="css/images/twitter_min.png"></a>
						<a href="https://www.youtube.com/user/um5s" target="new_tab"><img src="css/images/youtube_min.png"></a>
						<a href="https://fr.linkedin.com/school/um5rabat" target="new_tab"><img src="css/images/linkedin_min.png"></a>			
					</div>		
				</div>
				
				<br><br>
		
				<div class="row text-center col-xs-12 col-sm-12 col-md-12 col-lg-12">
					© 2021 Université Mohammed V de Rabat
				</div>	
							
			</footer>			
							
		</div>
