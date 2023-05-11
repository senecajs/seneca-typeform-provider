"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Pkg = require('../package.json');
const { createClient } = require('@typeform/api-client');
function TypeformProvider(options) {
    const seneca = this;
    const entityBuilder = this.export('provider/entityBuilder');
    seneca.message('sys:provider,provider:typeform,get:info', get_info);
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'typeform',
            version: Pkg.version,
            sdk: {
                name: 'typeform',
                version: Pkg.dependencies['@typeform/api-client'],
            },
        };
    }
    entityBuilder(this, {
        provider: {
            name: 'typeform',
        },
        entity: {
            form: {
                cmd: {
                    list: {
                        action: async function (entsize, msg) {
                            let res = await this.shared.sdk.forms.list();
                            let list = res.items.map((data) => entsize(data));
                            return list;
                        },
                    },
                    load: {
                        action: async function (entize, msg) {
                            let q = msg.q || {};
                            let id = q.id;
                            try {
                                let res = await this.shared.sdk.forms.get({ uid: id });
                                return entize(res);
                            }
                            catch (e) {
                                if (e.message.includes('invalid id')) {
                                    return null;
                                }
                                else {
                                    throw e;
                                }
                            }
                        },
                    },
                },
            },
            addform: {
                cmd: {
                    load: {
                        action: async function (entsize, msg) {
                            let q = msg.q || {};
                            let data = q.data;
                            try {
                                let res = await this.shared.sdk.forms.create({
                                    data: data
                                });
                                return entsize(res);
                            }
                            catch (e) {
                                throw e;
                            }
                        },
                    }
                }
            },
            editform: {
                cmd: {
                    load: {
                        action: async function (entsize, msg) {
                            let q = msg.q || {};
                            let id = q.id;
                            let data = q.data;
                            let override = q.override;
                            try {
                                let res = await this.shared.sdk.forms.update({
                                    uid: id,
                                    data: data,
                                    override: override
                                });
                                return entsize(res);
                            }
                            catch (e) {
                                if (e.message.includes('invalid id')) {
                                    return null;
                                }
                                else {
                                    throw e;
                                }
                            }
                        },
                    },
                }
            }
        },
    });
    seneca.prepare(async function () {
        let res = await this.post('sys:provider,get:keymap,provider:typeform,key:accesstoken');
        let token = res.keymap.accesstoken.value;
        this.shared.sdk = createClient({ token });
    });
    return {
        exports: {
            sdk: () => this.shared.sdk,
        },
    };
}
// Default options.
const defaults = {
    // TODO: Enable debug logging
    debug: false,
};
Object.assign(TypeformProvider, { defaults });
exports.default = TypeformProvider;
if ('undefined' !== typeof module) {
    module.exports = TypeformProvider;
}
//# sourceMappingURL=typeform-provider.js.map