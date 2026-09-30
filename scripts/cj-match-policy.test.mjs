import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesIntendedProduct,hasApprovedProductClass,approvedClassCount} from './cj-match-policy.mjs';

test('every research category has an explicit positive identity policy',()=>{
 const positives=[
 ['cordless-handheld-vacuum','Cordless Portable Handheld Vacuum Cleaner'],
 ['extendable-high-zone-duster','Extendable High Reach Microfiber Duster'],
 ['dryer-vent-cleaner-kit','Dryer Vent Cleaning Brush Kit'],
 ['self-standing-floor-mop','Self Standing Floor Mop'],
 ['window-washer-squeegee','Window Washer Squeegee Cleaner'],
 ['roll-up-dish-rack','Roll-Up Dish Drying Rack'],
 ['appliance-cord-organizer','Kitchen Appliance Cord Organizer Holder'],
 ['rug-grippers','Non-slip Rug Grippers'],
 ['rug-grippers','Reusable Adhesive Carpet Gripper'],
 ['rug-grippers','Non Slip Rug Corner Pads'],
 ['bottle-brush-set','Bottle Brush Cleaning Set'],
 ['sheet-laundry-detangler','Sheet Laundry Detangler Ball'],
 ['hanging-closet-organizer','Hanging Closet Shelf Storage Organizer'],
 ['pan-scraper','Non-Scratch Pan Scraper'],
 ];
 assert.equal(approvedClassCount(),12);
 for(const [slug,name] of positives){
   assert.equal(hasApprovedProductClass(slug),true,slug);
   assert.equal(matchesIntendedProduct({slug},name),true,slug+' '+name);
 }
});
test('rejects all known CJ false positives including live supplier results',()=>{
 const negatives=[
 ['cordless-handheld-vacuum','VEVOR Wet Dry Vac, 2.6 Gallon, 2.5 Peak HP, 3 In 1 Shop Vacuum With Blowing Function, Portable With Attachments To Clean Floor, Upholstery, Gap, Car, ETL Listed, Yellow'],
 ['hanging-closet-organizer','Wall-door Mounted Jewelry Wardrobe Large Capacity Mirror And LED Light Lockable Organizer'],
 ['cordless-handheld-vacuum','VEVOR Stand Airless Paint Sprayer'],
 ['hanging-closet-organizer','Shoe Cabinet With 2 Flip Drawers'],
 ['roll-up-dish-rack','Flower Print Lace-up Sneakers'],
 ['cordless-handheld-vacuum','Portable Industrial Wet-Dry Shop Vac'],
 ['rug-grippers','Kitchen Rug Sets Of 3 Washable Boho Kitchen Rugs And Runner Carpets Non Slip Kitchen Area Rug For Laundry Room Entryway Hallway'],
 ['rug-grippers','Non Slip Carpet'],
 ['rug-grippers','Adhesive Rug'],
 ];
 for(const [slug,name] of negatives) assert.equal(matchesIntendedProduct({slug},name),false,slug+' '+name);
 assert.equal(matchesIntendedProduct({slug:'not-approved'},'Brand new stock'),false);
 assert.equal(matchesIntendedProduct({slug:'bottle-brush-set'},null),false);
});
