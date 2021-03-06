fx_version 'cerulean'
game 'gta5'

author 'mufty'
description 'MRP Apartments'
version '0.0.1'

dependencies {
    "mrp_core"
}

files {
    'config/config.json',
}

shared_scripts {
    '@mrp_core/shared/debug.js'
}

client_scripts {
    'client/*.js',
}

server_scripts {
    'server/*.js',
}
