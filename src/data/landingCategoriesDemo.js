/*
  About Hifadhi: perishable categories shown in the horizontal showcase.

  Images: retail environment photos in src/assets (not the isolated studio
  shots used in the hero). To replace a photo, overwrite the file below or
  change its import. imagePosition is the CSS object-position used to keep
  the important part of each photo in view when the panel crops it.
*/
import produceImg from '../assets/freshproduce.png';
import dairyImg from '../assets/Dairy.png';
import bakeryImg from '../assets/bakery.png';
import poultryImg from '../assets/poultry.png';

export const aboutCategories = [
  {
    id: 'produce',
    number: '01',
    name: 'Fresh produce',
    statement: 'Fresh produce moves quickly. Inventory decisions should too.',
    items: ['Fruits', 'Vegetables', 'Fresh produce'],
    image: produceImg,
    imagePosition: '50% 55%',
    imageAlt: 'Supermarket produce display with fruit and vegetables',
  },
  {
    id: 'dairy',
    number: '02',
    name: 'Dairy',
    statement: 'Every remaining day matters.',
    items: ['Milk', 'Yoghurt', 'Cheese'],
    image: dairyImg,
    imagePosition: '38% 45%',
    imageAlt: 'Refrigerated dairy section with milk, yoghurt and cheese',
  },
  {
    id: 'bakery',
    number: '03',
    name: 'Bakery',
    statement: 'Short shelf life. Small window for intervention.',
    items: ['Bread', 'Pastries', 'Baked goods'],
    image: bakeryImg,
    imagePosition: '32% 50%',
    imageAlt: 'In-store bakery display with bread and pastries',
  },
  {
    id: 'meat',
    number: '04',
    name: 'Meat & poultry',
    statement: 'Earlier visibility supports better decisions before expiry.',
    items: ['Meat', 'Poultry', 'Eggs'],
    image: poultryImg,
    imagePosition: '30% 45%',
    imageAlt: 'Refrigerated supermarket meat and poultry display',
  },
];
