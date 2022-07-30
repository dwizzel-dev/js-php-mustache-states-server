
//some utils
const _randId = () => 'ID' + Math.random().toString().replace('.', '')

const _sleep = m => new Promise((resolve, reject) => setTimeout(() => {resolve()}, m))

const _diff = (a1, a2) => a2.filter(d => !a1.includes(d))

const _intersect = (a1, a2) => a2.filter(d => a1.includes(d))

//load import async
 const _load = async (name) => {
    return new Promise((resolve, reject) => {
        import(`/js/modules/${name}.mjs`).then((s) => {
            resolve(s)
        }).catch((e) => {
            reject(e)
        });
    })
}

//load file data async
const _file= async (f) => {
    return new Promise((resolve, reject) => {
        try{
            fetch((new URL(`/data/${f}`, window.top.location)).href).then((e) => {
                if (200 !== e.status){
                    reject()
                }    
                resolve(e.json());
            }).catch((e) => {
                reject(e)
            });
        }catch(e){
            reject(e)
        }    
    })
}

//check if element still there
const _garbage = async () => {
    return new Promise((resolve, reject) => {
        if(!bindedElementIds.length){
            resolve()
        }
        //let removed = []
        //get all present ids
        const present = [];
        document.querySelectorAll("[data-uid]").forEach((el) => {
            present.push(el.dataset.uid)
        })
        const diff = _diff(present, bindedElementIds)
        if(diff.length){
            //removeed from binded listener
            ModStates.unregister(diff)
            //remove from the stack
            bindedElementIds = _intersect(present, bindedElementIds)        
            //sopme debug
            console.log('BINDEDELEMENTIDS:', {bindedElementIds})
        }    
        resolve()   
    })
}

//main module for states

const ModStates = await _load('states').then((r) => r).catch((e) => null)
const ModMustache = (await _load('mustache').then((r) => r).catch((e) => null)).default

let bindedElementIds = []

const binded = async (item) => {
    if(item.dataset.isbinded !== undefined){
        return
    }
    const uid = _randId()
    item.dataset.uid = uid
    item.dataset.isbinded = 1
    const bindd = item.dataset.binded
    const tpl = item.dataset.templated
    const type = item.tagName
    //get the template from html template or base64 values
    const template = tpl !== undefined ? (
        tpl.indexOf('@') !== 0 ? atob(tpl) : document.querySelector(`template[data-template="${tpl.replace('@', '')}"]`).innerHTML
     ) : null
    //cache the template
    if(template !== null){
        ModMustache.parse(template)
    }        
    //view redering on load and states modifications
    const render = (v) => {
        switch(type){
            case 'INPUT':
                item.value = typeof v === 'string' ? v : ''
                break
            default:
                if(v === null){
                    item.innerHTML = ''   
                }
                if(template !== null){
                    //just testing smaller object OR maybe will use the complete ModStates.geStates() instead
                    //get the needed states for that template to work
                    let st = {}
                    bindd.split(',').forEach((prop) => {
                        prop = prop.trim()
                        let tmp = ModStates.getStates(prop)
                        if(prop.indexOf('.') !== -1){
                            const create = (s, a) => {
                                let it = a.shift();
                                if(a.length){
                                    if(s[it] === undefined){
                                        s[it] = {};
                                    }
                                    create(s[it], a);    
                                }else{
                                    s[it] = tmp
                                }
                            }
                            create(st, prop.split('.'))  
                        }else{
                            st[prop] = tmp
                        }    
                    })
                    //use the created states and use that template to render it    
                    item.innerHTML = ModMustache.render(template, st)
                }else{
                    //just display the object as string
                    item.innerHTML = JSON.stringify(v)
                }
                break    
        }
    }
    //states observer listener whatever
    bindd.split(',').forEach((prop) => {
        prop = prop.trim()
        const state = prop.length ? ModStates.getStates(prop) : ModStates.getStates()
        if(state !== null){
            render(state)
        }
        ModStates.register(prop, uid, (v) => render(v))
    })
    //some observer on mutations
    bindedElementIds.push(uid)
}

const binders = async (item) => {
    try{
        if(item.dataset.isbinders !== undefined){
            return
        }
        item.dataset.isbinders = 1
        let obj = null
        const bd = item.dataset.binders
        if(bd.indexOf('@') !== -1){
            obj = await _file(bd.replace('@', ''))
            await ModStates.setStates(item.value, obj)        
        }else{
            obj = JSON.parse(atob(bd))
        }
        if(obj.hasOwnProperty('functions')){
            //convert it to to real function
            Object.keys(obj.functions).forEach((k) => {
                //get eh string functions
                let func = obj.functions[k]
                console.log(`FUNCTION-MAPPING[${k}]:\n ${func} \n`)
                //remap to real functionnal functions
                //where func could be : ' return "<i>" + render(text) + "</i>"; '
                obj.functions[k] = () => (text, render) => {
                    return Function('render', 'text', `
                        "use strict";
                        //console.log(render, text);
                        ${func};
                    `)(render, text)
                } 
            })
        }
        //await ModStates.setStates(item.value, obj)        
        ModStates.setStates(item.value, obj)        

    }catch(e){
        console.error(e)
    }    
}

const binding = async (item) => {
    if(item.dataset.isbinding !== undefined){
        return
    }
    item.dataset.isbinding = 1
    const prop = item.dataset.binding
    //we have some so update the prop but do not save the rollback
    if(item.value.length){
        await ModStates.setStates(prop, item.value, true)
    }else{
        //we have none so check the states if we have one use that value
        const state = ModStates.getStates(prop)
        if(state !== null){
            item.value = state
        }
    }
    item.oninput = async (ev) => await ModStates.setStates(prop, ev.target.value)
}

const action = async (item) => {
    if(item.dataset.isaction !== undefined){
        return
    }
    item.dataset.isaction
    const action = item.dataset.action
    const prop = item.dataset.prop
    //we have some so update the main
    switch(action){
        case 'delete':
            item.onclick = async (ev) => await ModStates.delStates(prop)
            break;
        case 'undo':
            item.onclick = async (ev) => await ModStates.undoStates()
            break;    
        default:
            break;    
    }
}

const gstates = async(p) => {
    return await ModStates.getStates(p)
}

const sstates = async(p, v) => {
    await ModStates.setStates(p, v)
}

const obsstates = async(prop, cb) => {
    await ModStates.observe(prop, cb)
}

(async () => {
    console.log('STARTER-STATES', {
        states: await ModStates.getStates(), 
        ModMustache
    })
})();

(async () => {
    let collect = async () => {
        //check the elemnt not there anymore
        await _garbage()
        await _sleep(10000)
        collect()
    }
    await _sleep(10000)
    collect();
})();



export {binded, binders, binding, action, gstates, sstates, obsstates}

//EOF