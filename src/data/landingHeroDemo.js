/*
  Landing page hero story: ILLUSTRATIVE DEMO VALUES ONLY.
  These figures are fixed marketing examples for the public landing page.
  They are not connected to the dashboard demo data or to any prediction
  model, and must not be presented as real model output.

  focus: where the food sits inside each photo (percent of image width and
  height). It centres the soft edge fade on the product.
  zoom: display size relative to the tomato photo, so wider compositions
  (bread, vegetables) stay clear of the headline.
*/
import breadImage from '../assets/bread.png';
import milkImage from '../assets/milk.png';
import tomatoImage from '../assets/tomato.png';
import vegetablesImage from '../assets/vegetables.png';

export const heroStoryProducts = [
  {
    id: 'tomatoes',
    category: 'Tomatoes',
    image: tomatoImage,
    focus: { x: 38, y: 52 },
    zoom: 1,
    stock: 48,
    daysToExpiry: 4,
    expectedDemand: 31,
    atRisk: 17,
    recommendation: 'Consider markdown',
  },
  {
    id: 'vegetables',
    category: 'Fresh Vegetables',
    image: vegetablesImage,
    focus: { x: 42, y: 52 },
    zoom: 0.9,
    stock: 42,
    daysToExpiry: 5,
    expectedDemand: 35,
    atRisk: 7,
    recommendation: 'Prioritise older stock',
  },
  {
    id: 'dairy',
    category: 'Dairy',
    image: milkImage,
    focus: { x: 36, y: 50 },
    zoom: 0.96,
    stock: 36,
    daysToExpiry: 3,
    expectedDemand: 28,
    atRisk: 8,
    recommendation: 'Consider markdown',
  },
  {
    id: 'bakery',
    category: 'Bakery',
    image: breadImage,
    focus: { x: 46, y: 48 },
    zoom: 0.8,
    stock: 30,
    daysToExpiry: 2,
    expectedDemand: 21,
    atRisk: 9,
    recommendation: 'Consider redistribution',
  },
];
