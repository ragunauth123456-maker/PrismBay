import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesIntendedProduct,hasApprovedProductClass,approvedClassCount} from './cj-match-policy.mjs';

test('every live and research category has an explicit positive identity policy',()=>{
 const positives=[
 ['scrubber','Electric Spin Scrubber Cleaning Tool'],
 ['pethair','Reusable Pet Hair Remover Roller'],
 ['crevice','Gap Crevice Cleaning Brush'],
 ['pressure-washer','Cordless Portable Pressure Washer'],
 ['mattress-vacuum','Mattress Bed Vacuum Cleaner'],
 ['garment-steamer','Portable Garment Clothes Steamer'],
 ['mini-mop','Mini Self Squeeze Mop'],
 ['drain-catcher','Sink Drain Strainer Catcher'],
 ['home-caddy','Portable Cleaning Supply Caddy'],
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
 assert.equal(approvedClassCount(),21);
 for(const [slug,name] of positives){
   assert.equal(hasApprovedProductClass(slug),true,slug);
   assert.equal(matchesIntendedProduct({slug},name),true,slug+' '+name);
 }
});

test('rejects known CJ and live-store false positives',()=>{
 const negatives=[
 ['scrubber','Electric Spin Scrubber Replacement Brush Heads'],
 ['pethair','Pet Grooming Deshedding Brush'],
 ['crevice','Vacuum Crevice Nozzle Attachment'],
 ['pressure-washer','Cordless Pressure Washer Nozzle Replacement'],
 ['mattress-vacuum','Mattress Storage Bag'],
 ['garment-steamer','Facial Steamer'],
 ['mini-mop','Mini Mop Replacement Pad Only'],
 ['drain-catcher','Drain Snake Auger'],
 ['home-caddy','Shower Caddy Organizer'],
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
