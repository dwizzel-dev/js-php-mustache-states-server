
//import { mustache } from '../modules/mustache.mjs';

const prefix = '@'
let states = {}
let registered = {}
let undos = []
let observables = {};

const _sleep = m => new Promise((resolve, reject) => setTimeout(() => {resolve()}, m))

async function setStates(prop, value, nosave) {
    await _sleep(0)
    if (states) {
        if(nosave === undefined){
            _save(prop, value)
        }
        const rtn = Function('states', 'value', `
            "use strict";
            try{
                //if at same props merge them to keep that all and overwrite by the newest
                //in ca an array or object was passed
                states.${prop} = ['object', 'array'].indexOf(typeof value) !== -1 && typeof states.${prop} === 'object' ?
                    {...states.${prop}, ...value} : value;
            }catch(e){
                //the object didnt exist so will create it
                const rb = (s, a, v) => {
                    let it = a.shift();
                    if(a.length){
                        if(s[it] === undefined || s[it] === null){
                            s[it] = {};
                        }
                        rb(s[it], a, v);       
                    }else{
                        s[it] = value;
                    }
                }
                try{
                    rb(states, '${prop}'.split('.'), value);
                }catch(e){
                    console.log('ERROR:', e);
                    return null;
                }    
                return true;
            }
            return true;
        `)(states, value)
        if (rtn) {
            _updated(prop)
            return rtn
        }
        console.error('STATE-NOT-UPDATED', rtn, states);
        return null
    }
    return null
}

async function delStates(prop) {
    await _sleep(0)
    if (states) {
        _save(prop)
        const rtn = Function('states', 'value', `
            "use strict";
            try{
                if('${prop}' === 'undefined'){
                    states = {}    
                }else{
                    delete states.${prop}
                }
            }catch(e){
                console.log('ERROR:', e);
                return false;
            }
            return true;
        `)(states)
        if (rtn) {
            _deleted(prop)
            return rtn
        }
        console.error('STATE-NOT-DELETED', rtn, states);
        return null
    }
    return null
}

function getStates(name) {
    if (states) {
        if(!arguments.length) {
            return states    
        }
        return (
            Function('states', `
                "use strict";
                try{
                    return states.${name};
                }catch(e){
                    return null;
                }
            `)(states) ?? null
        )
    }
    return null
}

function register(prop, uid, cb){
    prop = `${prefix}${prop}`
    if(registered[prop] === undefined){
        registered[prop] = {};
    }
    registered[prop][uid] = cb
}

function unregister(uids){
    uids = typeof uids === 'string' ? [uids] : uids
    //remove the elements
    uids.forEach((uid) => {
        Object.keys(registered).forEach((prop) => {
            if(registered[prop][uid] !== undefined){
                console.log('UNREGISTER:', uid)
                delete registered[prop][uid]
            }
        })
    })
    //remove the keys if no element in item
    Object.keys(registered).forEach((prop) => {
        if(!Object.keys(registered[prop]).length){
            delete registered[prop]
        }
    })
}

function observe(prop, cb){
    prop = `${prefix}${prop}`
    if(observables[prop] === undefined){
        observables[prop] = [];
    }
    observables[prop].push(cb)
}

function _deleted(prop){
    //console.log('STATE-DELETED', {prop, states, registered});
    let keys = Object.keys(registered).filter((k) => {
        return (new RegExp(`${prefix}${prop}`)).test(k);
    });
    if(keys.length){
        keys.forEach((k) => {
            Object.keys(registered[k]).forEach((item) => registered[k][item](getStates(k.replace(prefix, ''))))        
        })
    }
    keys = Object.keys(observables).filter((k) => {
        return (new RegExp(`${prefix}${prop}`)).test(k);
    });
    if(keys.length){
        keys.forEach((k) => {
            observables[k].forEach((f) => f(getStates(k.replace(prefix, ''))))        
        })
    }
}

function _updated(prop){
    console.log('STATE-UPDATED', {prop, states, registered, undos, observables});
    if(prop.indexOf('.') !== -1){
        const rb = (a, s) => {
            let it = a.shift();
            s += !s.length ? it : `.${it}`
            let k = `${prefix}${s}`
            let gs = null
            if(typeof registered[k] === 'object'){
                Object.keys(registered[k]).forEach((item) => registered[k][item](getStates(s)))
            }
            if(typeof observables[k] === 'object'){
                observables[k].forEach((f) => f(gs ?? getStates(s)))
            }    
            if(a.length){
                rb(a, s);    
            }
        }
        rb(prop.split('.'), '')
    }else{
        let k = `${prefix}${prop}`
        let gs = null
        if(typeof registered[k] === 'object'){
            gs = getStates(prop);
            Object.keys(registered[k]).forEach((item) => registered[k][item](gs))
        }
        if(typeof observables[k] === 'object'){
            observables[k].forEach((f) => f(gs ?? getStates(prop)))
        }
    }
}

function _save(prop, v){
    try{
        let s = getStates(prop)
        //TODO: type marital B, clear, type marital B, clear, than Undo
        //So if the object wasnt there the return is null so we are missing the first A when undoiing
        //because that property didnt exist at first before writing the data which creates that prop it
        //so it must come from an input which is a string, in that case we will create the object with empty data
        //NO null because null is an object in JS
        if(s !== null){    
            undos.push({
                prop,
                json: typeof s === 'object' ? {...s} : s
            })
        }    
    }catch(e){
        console.error(e)
    }
}

async function undoStates(){
    try{
        if(undos.length){
            const undo = undos.pop()
            if(undo.prop !== undefined && undo.json !== undefined){
                setStates(undo.prop, undo.json, true).then((r) => {
                    let keys = Object.keys(registered).filter((k) => {
                        return (new RegExp(`${prefix}${undo.prop}`)).test(k);
                    });
                    if(keys.length){
                        keys.forEach((k) => {
                            Object
                            .keys(registered[k])
                            .forEach((item) => registered[k][item](getStates(k.replace(prefix, ''))))
                        })
                    }
                    keys = Object.keys(observables).filter((k) => {
                        return (new RegExp(`${prefix}${undo.prop}`)).test(k);
                    });
                    if(keys.length){
                        keys.forEach((k) => {
                            observables[k].forEach((f) => f(getStates(k.replace(prefix, ''))))
                        })
                    }
                })
            }
        }    
    }catch(e){
        console.error(e)
    }    
}

export { setStates , getStates, delStates, undoStates, register, unregister, observe }

//EOF