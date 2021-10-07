MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

eval(LoadResourceFile('mrp_core', 'client/helpers.js'));

const configFile = LoadResourceFile(GetCurrentResourceName(), 'config/config.json');

const config = JSON.parse(configFile);

const localeConvar = GetConvar("mrp_locale", "en");
const locale = config.locale[localeConvar];

let portToLocation = (location) => {
    let ped = PlayerPedId();
    SetEntityCoords(ped, location.x, location.y, location.z, true, false, false, false);
};

let thirdMenuAdded = false;

setInterval(() => {
    let ped = PlayerPedId();
    let [pX, pY, pZ] = GetEntityCoords(ped);
    let foundEntrance = false;
    let foundExit = false;
    for (let interior of config.interiors) {
        let distEntrance = Vdist(pX, pY, pZ, interior.entrance.x, interior.entrance.y, interior.entrance.z);
        if (distEntrance <= config.doorDistance) {
            emit('mrp:thirdeye:addMenuItem', {
                location: interior,
                id: 'use_apartment_doors',
                text: locale.enterHelpText,
                action: 'https://mrp_apartments/enter'
            });

            thirdMenuAdded = true;
            foundEntrance = true;
        }

        let distExit = Vdist(pX, pY, pZ, interior.exit.x, interior.exit.y, interior.exit.z);
        if (distExit <= config.doorDistance) {
            emit('mrp:thirdeye:addMenuItem', {
                location: interior,
                id: 'use_apartment_doors',
                text: locale.exitHelpText,
                action: 'https://mrp_apartments/exit'
            });

            thirdMenuAdded = true;
            foundExit = true;
        }
    }

    if (!foundEntrance && !foundExit && thirdMenuAdded) {
        thirdMenuAdded = false;
        emit('mrp:thirdeye:removeMenuItem', {
            id: 'use_apartment_doors'
        });
    }
}, 0);

RegisterNuiCallbackType('enter');
on('__cfx_nui:enter', (data, cb) => {
    cb({});

    let loc = data.location;
    if (loc) {
        DoScreenFadeOut(config.tpFadeTime);
        emitNet('mrp:apartments:server:enter', loc);
    }
});

RegisterNuiCallbackType('exit');
on('__cfx_nui:exit', (data, cb) => {
    cb({});

    let loc = data.location;
    if (loc) {
        DoScreenFadeOut(config.tpFadeTime);
        emitNet('mrp:apartments:server:exit', loc);
    }
});

let portTo = async (loc) => {
    thirdMenuAdded = false;
    emit('mrp:thirdeye:removeMenuItem', {
        id: 'use_apartment_doors'
    });

    let ped = PlayerPedId();

    //port
    MRP_CLIENT.portToLocation(ped, loc);

    DoScreenFadeIn(config.tpFadeTime);
    await utils.sleep(config.tpFadeTime * 2);
};

onNet('mrp:apartments:client:enter', (loc) => {
    portTo(loc.exit);
});

onNet('mrp:apartments:client:exit', (loc) => {
    portTo(loc.entrance);
});