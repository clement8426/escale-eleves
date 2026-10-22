/** @type {{id:string,name:string,subtitle:string,price:number,category:string,shape:string,color:string,badge:string,description:string}[]} */
export const products = [
    ['sac-weekend', 'Le Week-end', 'Sac 32 L', 129, 'Sacs', 'bag', '#586b50', 'Notre essentiel', 'Un week-end, juste l’essentiel. Toile épaisse, poche intérieure et bandoulière amovible.'],
    ['sac-cabine', 'Le Cabine', 'Sac 24 L', 109, 'Sacs', 'bag', '#b27858', 'Cabine', 'Compact et souple, il garde vos affaires à portée de main dans le train.'],
    ['sac-quotidien', 'Le Quotidien', 'Sac à dos 18 L', 89, 'Sacs', 'backpack', '#c4ac84', 'Nouveau', 'Un sac pour les détours, avec une poche rembourrée pour ordinateur.'],
    ['sac-plage', 'Le Grand Air', 'Cabas 28 L', 65, 'Sacs', 'tote', '#bfb194', '', 'Un grand volume léger pour les journées qui se prolongent.'],
    ['gourde-olive', 'La Nomade', 'Gourde 600 ml', 32, 'Accessoires', 'bottle', '#77816b', 'Favori', 'Une gourde en acier à double paroi, pour garder le rythme toute la journée.'],
    ['gourde-terre', 'La Terre', 'Gourde 600 ml', 32, 'Accessoires', 'bottle', '#b77e62', '', 'La même contenance, une teinte chaude et un bouchon étanche.'],
    ['trousse-sauge', 'La Sauge', 'Trousse de toilette', 39, 'Organisation', 'pouch', '#90987a', '', 'Une trousse souple avec une large ouverture et une doublure lavable.'],
    ['trousse-sable', 'La Sable', 'Trousse de toilette', 39, 'Organisation', 'pouch', '#c5ad8a', '', 'Vos petits indispensables, tous au même endroit.'],
    ['cubes-voyage', 'Les Organisés', 'Lot de 3 pochettes', 45, 'Organisation', 'cubes', '#bcb39d', 'Bien pensé', 'Trois formats pour séparer les vêtements sans tout défaire.'],
    ['pochette-passeport', 'Le Passage', 'Porte-passeport', 29, 'Accessoires', 'passport', '#796d51', '', 'Passeport et cartes réunis dans un étui discret.'],
    ['carnet-route', 'Le Détour', 'Carnet de voyage', 19, 'Accessoires', 'notebook', '#b78060', '', 'Des pages pour noter une adresse, dessiner un lieu ou ne rien prévoir.'],
    ['etiquette-bagage', 'Le Repère', 'Étiquette de bagage', 15, 'Accessoires', 'tag', '#8c9c82', '', 'Un repère simple pour reconnaître votre sac.'],
    ['pochette-tech', 'La Connectée', 'Pochette câbles', 35, 'Organisation', 'pouch', '#6b7974', '', 'Chargeur, écouteurs et câbles restent faciles à retrouver.'],
    ['sac-banane', 'La Libre', 'Sac ceinture', 49, 'Sacs', 'pouch', '#626952', '', 'L’essentiel près de soi, pour explorer les mains libres.'],
    ['serviette-lin', 'La Légère', 'Serviette de voyage', 29, 'Accessoires', 'towel', '#c2b39d', '', 'Une serviette compacte pour la plage ou un détour imprévu.'],
    ['masque-nuit', 'La Pause', 'Masque de repos', 22, 'Accessoires', 'mask', '#7a8277', '', 'Une pause douce pendant les longs trajets.'],
    ['housse-ordinateur', 'La Studieuse', 'Housse 14 pouces', 45, 'Organisation', 'sleeve', '#9e947e', '', 'Une housse rembourrée, simple à glisser dans votre sac.'],
    ['cabas-pliable', 'Le Complice', 'Cabas pliable', 25, 'Sacs', 'tote', '#8e9a80', '', 'Il se replie dans sa poche pour accompagner les imprévus.']
].map(([id, name, subtitle, price, category, shape, color, badge, description]) => ({ id, name, subtitle, price, category, shape, color, badge, description }));
export const money = value => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(value);
export const findProduct = id => products.find(p => p.id === id);
