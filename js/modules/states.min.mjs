const prefix="@";let states={},registered={},undos=[],observables={};const _sleep=a=>new Promise(b=>setTimeout(()=>{b()},a));async function setStates(a,b,c,d){await _sleep(0);{void 0===c&&_save(a,b);const e=Function("states","value",`
            "use strict";
            try{
                //if at same props merge them to keep that all and overwrite by the newest
                //in ca an array or object was passed
                states.${a} = ['object', 'array'].indexOf(typeof value) !== -1 && typeof states.${a} === 'object' ?
                    {...states.${a}, ...value} : value;
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
                    rb(states, '${a}'.split('.'), value);
                }catch(e){
                    console.log('ERROR:', e);
                    return null;
                }    
                return true;
            }
            return true;
        `)(states,b);return e?(void 0===d&&_updated(a),e):(console.error("STATE-NOT-UPDATED",e,states),null)}return null}async function delStates(a){await _sleep(0);{_save(a);const b=Function("states","value",`
            "use strict";
            try{
                if('${a}' === 'undefined'){
                    states = {}    
                }else{
                    delete states.${a}
                }
            }catch(e){
                console.log('ERROR:', e);
                return false;
            }
            return true;
        `)(states);return b?(_deleted(a),b):(console.error("STATE-NOT-DELETED",b,states),null)}return null}function getStates(a){return states?arguments.length?Function("states",`
                "use strict";
                try{
                    return states.${a};
                }catch(e){
                    return null;
                }
            `)(states)??null:states:null}function register(a,b,c){a=`${prefix}${a}`,registered[a]===void 0&&(registered[a]={}),registered[a][b]=c}function unregister(a){a="string"==typeof a?[a]:a,a.forEach(a=>{Object.keys(registered).forEach(b=>{registered[b][a]!==void 0&&(console.log("UNREGISTER:",a),delete registered[b][a])})}),Object.keys(registered).forEach(a=>{Object.keys(registered[a]).length||delete registered[a]})}function observe(a,b){a=`${prefix}${a}`,observables[a]===void 0&&(observables[a]=[]),observables[a].push(b)}function _deleted(a){let b=Object.keys(registered).filter(b=>new RegExp(`${prefix}${a}`).test(b));b.length&&b.forEach(a=>{Object.keys(registered[a]).forEach(b=>registered[a][b](getStates(a.replace(prefix,""))))}),b=Object.keys(observables).filter(b=>new RegExp(`${prefix}${a}`).test(b)),b.length&&b.forEach(a=>{observables[a].forEach(b=>b(getStates(a.replace(prefix,""))))})}function _updated(a){if(console.log("STATE-UPDATED",{prop:a,states,registered,undos,observables}),-1!==a.indexOf(".")){const b=(c,a)=>{let d=c.shift();a+=a.length?`.${d}`:d;let e=`${prefix}${a}`;"object"==typeof registered[e]&&Object.keys(registered[e]).forEach(b=>registered[e][b](getStates(a))),"object"==typeof observables[e]&&observables[e].forEach(b=>b(null??getStates(a))),c.length&&b(c,a)};b(a.split("."),"")}else{let b=`${prefix}${a}`,c=null;"object"==typeof registered[b]&&(c=getStates(a),Object.keys(registered[b]).forEach(a=>registered[b][a](c))),"object"==typeof observables[b]&&observables[b].forEach(b=>b(c??getStates(a)))}}function _save(a){try{let b=getStates(a);null!==b&&undos.push({prop:a,json:"object"==typeof b?{...b}:b})}catch(a){console.error(a)}}async function undoStates(){try{if(undos.length){const a=undos.pop();a.prop!==void 0&&a.json!==void 0&&setStates(a.prop,a.json,!0,!0).then(()=>{let b=Object.keys(registered).filter(b=>new RegExp(`${prefix}${a.prop}`).test(b));b.length&&b.forEach(a=>{Object.keys(registered[a]).forEach(b=>registered[a][b](getStates(a.replace(prefix,""))))}),b=Object.keys(observables).filter(b=>new RegExp(`${prefix}${a.prop}`).test(b)),b.length&&b.forEach(a=>{observables[a].forEach(b=>b(getStates(a.replace(prefix,""))))})})}}catch(a){console.error(a)}}export{setStates,getStates,delStates,undoStates,register,unregister,observe};