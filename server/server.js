const config = require('./config/config.json');

let localeConvar = GetConvar("mrp_locale", "en");
let locale = config.locale[localeConvar];

MRP_SERVER = null;

emit('mrp:getSharedObject', obj => MRP_SERVER = obj);

while (MRP_SERVER == null) {
    console.log('Waiting for shared object....');
}

onNet('mrp:apartments:server:enter', (location) => {
    let src = global.source;
    //TODO check keys, restrictions, instances, DB
    emitNet('mrp:apartments:client:enter', src, location);
});

onNet('mrp:apartments:server:exit', (location) => {
    let src = global.source;
    emitNet('mrp:apartments:client:exit', src, location);
});